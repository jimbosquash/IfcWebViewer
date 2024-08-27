import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import * as OBF from "@thatopen/components-front"
import * as THREE from 'three'
import { setUpTree } from "../../utilities/BuildingElementUtilities";
import { GetFragmentsFromExpressIds } from "../../utilities/IfcUtilities";
import { BuildingElement, SelectionGroup, VisibilityMode, VisibilityState } from "../../utilities/types";
import { Tree, TreeNode, TreeUtils } from "../../utilities/Tree";
import { _roots } from "@react-three/fiber";
import { ModelCache } from "../modelCache";



export class ModelViewManager extends OBC.Component {
    private _enabled = false;
    private _isSetup = false;
    static uuid = "0f5e514e-5c1c-4097-a9cc-6620c2e28378" as const;

    // Tree is a data structure we create similar to the file strucutre of an .ifc file though typicially we use element properties for robustness to determine groupings such as building steps and assembly
    // you can create a different tree strucutre and use it in other scenarios 
    private _tree?: Tree<BuildingElement>;

    // tree visibiliy is a map/dictionary of every node in a tree and stores the visibility state of eachnode. if a parent node is hidden this can be helpful to decide how to treat children nodes
    // you can create other visibility maps to suit other purposes such as materaial grouping
    private _treeVisibility?: Map<string, VisibilityState>;

    // the selection group defines the group which is actively being used across the software and is typically a building step or station
    // it helps us determine whats important to show the user and whats next and before this group when changing.
    private _selectedGroup?: SelectionGroup;

    readonly onTreeChanged = new OBC.Event<Tree<BuildingElement> | undefined>();
    readonly onBuildingElementsChanged = new OBC.Event<BuildingElement[]>();
    readonly onGroupVisibilitySet = new OBC.Event<Map<string, VisibilityState>>();
    readonly onSelectedGroupChanged = new OBC.Event<SelectionGroup>();
    readonly onVisibilityModeChanged = new OBC.Event<VisibilityMode>();

    get SelectedGroup(): SelectionGroup | undefined {
        return this._selectedGroup;
    }
    set SelectedGroup(selectionGroup: SelectionGroup | undefined) {
        if (!selectionGroup) return;
        this._selectedGroup = selectionGroup;
        console.log("ModelViewManager: selected group changed:", selectionGroup)
        this.onSelectedGroupChanged.trigger(this._selectedGroup)

        // Add any additional logic needed when setting the selection group
    }

    get Tree(): Tree<BuildingElement> | undefined {
        return this._tree;
    }

    constructor(components: OBC.Components) {
        super(components);

        const frag = components.get(OBC.FragmentsManager)
        frag.onFragmentsDisposed.add((data) => this.cleanUp(data.groupID, data.fragmentIDs))
    }

    cleanUp = (groupID: string, fragmentIDs: string[]) => {}

    /**
     * search tree strucutre for a node with a name matching the groupID. 
     * @param groupId name of selection group to search tree
     * @returns undefined or a flat collection of children building elements.
     */
    getBuildingElements = (groupId: string): BuildingElement[] | undefined => {
        if (!groupId || !this._tree) return;

        const groupNode = this._tree.getNode(groupId);

        if (!groupNode) return;

        return TreeUtils.getChildrenNonNullData(groupNode)
    }

  /**
   * Sets up Tree strucutre based on building elements properties and ignortes the ifc file structure
   * 
   */
    setUpGroups = (buildingElements: BuildingElement[] | undefined, groupVisibility?: Map<string, VisibilityState>): void => {
        if (!buildingElements) {
            this.onTreeChanged.trigger(undefined);
            return;
        }

        this._tree = setUpTree(buildingElements);
        console.log("tree created:", this._tree)
        this.onTreeChanged.trigger(this._tree);

        this._treeVisibility = this.createDefaultTreeVisibility();
        console.log("tree vis:", this._treeVisibility)
        this._selectedGroup = undefined;
        this._enabled = true;
        this.onGroupVisibilitySet.trigger(this._treeVisibility);
        this.updateVisibility();
    }


    private createDefaultTreeVisibility(): Map<string, VisibilityState> {
        if (!this._tree) throw new Error("Tree not initialized");
        const keys = Array.from(this._tree.getFlatTreeNodes()).filter(element => element.type !== "BuildingElement").flatMap(a => a.id);
        console.log("tree vis:", this._treeVisibility)
        return new Map(keys.map(name => [name, VisibilityState.Visible]));
    }

    get GroupVisibility(): Map<string, VisibilityState> | undefined {
        return this._treeVisibility;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    private _visibilityMode: VisibilityMode = VisibilityMode.Isolate;

    get VisibilityMode(): VisibilityMode {
        return this._visibilityMode;
    }

    /**
     * visibilityMode determines how selected and non selected groupings will be displayed.
     */
    set VisibilityMode(value: VisibilityMode) {
        // console.log("Visibility mode set:", value)
        this._visibilityMode = value;
        this.onVisibilityModeChanged.trigger(this._visibilityMode);
    }

    /**
     * Group Visibility : key = group Name, value = visibility state. will be used to determine the visibility of geometry 
     * when triggering updateVisibility;
     */
    set GroupVisibility(value: Map<string, VisibilityState> | undefined) {
        // console.log("ModelViewManager: group vis being set", value);
        this._treeVisibility = value;
        this.onGroupVisibilitySet.trigger(this._treeVisibility);
        this.updateVisibility();
    }

    /**
     * displays all tree nodes before the selection group
     * @param group group to be made visible
     * @returns 
     */
    SequentiallyVisible(group: SelectionGroup) {
        if (!group.id) return;

        const node = this._tree?.getNode(group.id);
        const sameNodeTypes = this._tree?.getNodes(n => n.type === node?.type)
        if (!sameNodeTypes) return;

        const visibleNodes: TreeNode<BuildingElement>[] = [];
        const hiddenNodes: TreeNode<BuildingElement>[] = [];
        let nodeFound = false;

        sameNodeTypes.forEach(otherNode => {
            if (nodeFound) {
                hiddenNodes.push(otherNode)
                return;
            }
            if (otherNode === node) {
                visibleNodes.push(otherNode)
                nodeFound = true;
                return;
            }
            visibleNodes.push(otherNode)
        });

        hiddenNodes.forEach(treeNode => {
            this.setVisibility(treeNode.id, VisibilityState.Hidden, false)
        });

        // make each node, their parent and children are visible
        visibleNodes.forEach(treeNode => {
            this.setVisibility(treeNode.id, VisibilityState.Visible, false)
            if (treeNode.parent)
                this.setVisibility(treeNode.parent.id, VisibilityState.Visible, false)

            node?.children.forEach(childNode => { this.setVisibility(childNode.id, VisibilityState.Visible, false) })
        });

        node?.children.forEach(childNode => { this.setVisibility(childNode.id, VisibilityState.Visible, false) })
        this.onGroupVisibilitySet.trigger(this._treeVisibility);
        this.updateVisibility();


    }
/**
 * Using thatOpen OBF.highlighter component to highlight by express ids using the select highlight type. clearing the
 * select highlight collection before making the new selection
 * @param group group to be selected
 * @returns 
 */
    async select(group: SelectionGroup) {
        if (!group.id || !this.components) return;
        console.log("high light these elements")

        const highlighter = this.components.get(OBF.Highlighter);
        const modelCache = this.components.get(ModelCache);
    
        const node = this._tree?.getNode(group.id);
        if (!node) return;
    
        const buildingElements = TreeUtils.getChildren(node, n => n.data !== null && n.type === "BuildingElement");
    
        const elementsByModelId = new Map<string, BuildingElement[]>();
        for (const tNode of buildingElements) {
            const groupID = tNode.data?.modelID;
            if (!groupID || !tNode.data) continue;
            if (!elementsByModelId.has(groupID)) {
                elementsByModelId.set(groupID, []);
            }
            elementsByModelId.get(groupID)!.push(tNode.data);
        }
    
        await highlighter.clear('select');
    
        const highlightPromises = Array.from(elementsByModelId.entries()).map(async ([modelId, elements]) => {
            const model = modelCache.getModel(modelId);
            if (!model) return;
    
            const expressIds = elements.flatMap(e => e.expressID);
            const elementTypeIds = model.getFragmentMap(expressIds);
            console.log("high light these elements",elementTypeIds)
            await highlighter.highlightByID("select", elementTypeIds,false,false);
        });

    
        await Promise.all(highlightPromises);
    }

    

    isolate(group: SelectionGroup) {
        if (!group.id) return;

        const node = this._tree?.getNode(group.id);
        const sameNodeTypes = this._tree?.getNodes(n => n.type === node?.type)
        if (!sameNodeTypes) return;

        sameNodeTypes.forEach(treeNode => {
            this.setVisibility(treeNode.id, treeNode.id === group.id ? VisibilityState.Visible : VisibilityState.Hidden, false)
        });

        // make parent visible // note: should be recursive in future
        if (node?.parent)
            this.setVisibility(node.parent.id, VisibilityState.Visible, false)

        console.log('geting children of isolated node', node?.children)
        node?.children.forEach(childNode => { this.setVisibility(childNode.id, VisibilityState.Visible, false) })
        this.onGroupVisibilitySet.trigger(this._treeVisibility);
        this.updateVisibility();
    }

    // sets new value if key if found matching groupname. if update is true then 3d scene will update visibility based on change
    setVisibility(nodeId: string, state: VisibilityState, updateVisibility: boolean = false) {

        if (!this._treeVisibility || !nodeId || !this._treeVisibility?.has(nodeId)) {
            console.log("failed to change visibility,name not found:", nodeId, this._treeVisibility?.keys())
            return;
        }
        if (this._treeVisibility.get(nodeId) === state) {
            console.log("failed to change visibility, state already the same:", this._treeVisibility.get(nodeId))
            return;
        }

        this._treeVisibility.set(nodeId, state);

        if (updateVisibility) this.updateVisibility();
    }

    //private white = new THREE.Color(1, 1, 1);

    private SetVisibility(fragments: OBC.FragmentsManager, elements: BuildingElement[] | undefined, visibility: VisibilityState): void {

        if (!elements) return;
        const elementsByModelId = this.groupElementsByModelId(elements);

        //const transWhite = this.white.multiplyScalar(10);
        fragments.groups.forEach(model => {
            const elementsForModel = elementsByModelId.get(model.uuid);
            if (elementsForModel) {
                const allFragments = GetFragmentsFromExpressIds(elementsForModel.map(element => element.expressID), fragments, model);
                if (visibility === VisibilityState.Visible) {
                    allFragments.forEach((ids, frag) => frag.setVisibility(true, ids));
                    // allFragments.forEach((ids, frag) => frag.resetColor(ids));
                }
                else {
                    allFragments.forEach((ids, frag) => frag.setVisibility(false, ids));
                    // allFragments.forEach((ids, frag) => frag.setColor(transWhite, ids));
                }
            }
        });
    }

    // if color = true color will be reset to original
    private SetColor(fragments: OBC.FragmentsManager, elements: BuildingElement[], color: boolean | THREE.Color = false): void {
        const elementsByModelId = this.groupElementsByModelId(elements);

        fragments.groups.forEach(model => {
            const elementsForModel = elementsByModelId.get(model.uuid);
            if (elementsForModel) {
                const allFragments = GetFragmentsFromExpressIds(elementsForModel.map(element => element.expressID), fragments, model);
                if (color === true)
                    allFragments.forEach((ids, frag) => frag.resetColor(ids));
                else if (color instanceof THREE.Color)
                    allFragments.forEach((ids, frag) => frag.setColor(color, ids));
            }
        });
    }

    private groupElementsByModelId(elements: BuildingElement[]): Map<string, BuildingElement[]> {
        return elements.reduce((acc, element) => {
            if (!acc.has(element.modelID)) {
                acc.set(element.modelID, []);
            }
            acc.get(element.modelID)!.push(element);
            return acc;
        }, new Map<string, BuildingElement[]>());
    }

    private updateVisibility = () => {
        // console.log("update Visibility", this._treeVisibility)

        if (!this._enabled || !this.components || !this._tree) return;

        const fragments = this.components.get(OBC.FragmentsManager);
        if (!this._treeVisibility) {
            const allElements = this.getAllElements();
            this.SetVisibility(fragments, allElements, VisibilityState.Visible);
            console.log("hide elements fails, showing all instead")

            return;
        }

        const visibilityTypes = this.groupElementsByVisibilityState();
        if (visibilityTypes) {
            this.SetVisibility(fragments, visibilityTypes.get(VisibilityState.Visible), VisibilityState.Visible);
            this.SetVisibility(fragments, visibilityTypes.get(VisibilityState.Hidden), VisibilityState.Hidden);
            this.SetVisibility(fragments, visibilityTypes.get(VisibilityState.Ghost), VisibilityState.Ghost);
        }
    };

    private getAllElements(): BuildingElement[] | undefined {
        if (!this._tree?.root.id) return;
        return this.getBuildingElements(this._tree?.root.id);
    }

    // search element tree and group building elements by visibility state of their highest parent node 
    private groupElementsByVisibilityState(): Map<VisibilityState, BuildingElement[]> | undefined {

        if (!this._tree || !this._treeVisibility) return undefined;

        // 1. if the parent node is hidden, all children nodes will be hidden
        // 2. if parent node is ghost, children node of type visible and ghost will be ghost, and hidden remains hidden
        // 3. if parent node is visble nothing changes 

        const result = new Map<VisibilityState, BuildingElement[]>();
        result.set(VisibilityState.Visible, []);
        result.set(VisibilityState.Hidden, []);
        result.set(VisibilityState.Ghost, []);


        const traverseNode = (node: TreeNode<BuildingElement>, parentState: VisibilityState) => {

            if (!this._tree || !this._treeVisibility) return undefined;

            const nodeVisibility = this._treeVisibility.get(node.id) || parentState;

            if (node.isLeaf) {
                // This is a building element node
                switch (nodeVisibility) {
                    case VisibilityState.Hidden:
                        result.get(VisibilityState.Hidden)!.push(node.data!);
                        break;
                    case VisibilityState.Ghost:
                        result.get(VisibilityState.Ghost)!.push(node.data!);
                        break;
                    case VisibilityState.Visible:
                        result.get(VisibilityState.Visible)!.push(node.data!);
                        break;
                }
            } else {
                // This is a container node, traverse its children
                node.children.forEach(child => {
                    let childState = nodeVisibility;
                    if (nodeVisibility === VisibilityState.Ghost &&
                        this._treeVisibility?.get(child.id) === VisibilityState.Visible) {
                        childState = VisibilityState.Ghost;
                    }
                    traverseNode(child, childState);
                });
            }
        };

        // Start traversal from the root
        traverseNode(this._tree.root!, VisibilityState.Visible);
        // console.log("vis state grouped",result)
        return result;
    }
}