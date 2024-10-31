import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import { convertToBuildingElement, setUpTreeFromProperties } from "../../utilities/BuildingElementUtilities";
import { GetFragmentsFromExpressIds } from "../../utilities/IfcUtilities";
import { BuildingElement, IfcElement, KnownGroupType, knownProperties, SelectionGroup, VisibilityMode, VisibilityState } from "../../utilities/types";
import { TreeNode } from "../../utilities/Tree";
import { _roots } from "@react-three/fiber";
import { ModelCache } from "../modelCache";
import { TreeUtils } from "../../utilities/treeUtils";
import { ViewableTree } from "./src/viewableTree";
import { ConfigManager, ConfigSchema } from "../../utilities/ConfigManager";

export interface ModelViewerConfiguration {
    treeNavigation: "stepInto" | "stepOver";
}

const ModelViewerConfigSchema: ConfigSchema<ModelViewerConfiguration> = {
    treeNavigation: { defaultValue: "stepInto" },
};

export class ModelViewManager extends OBC.Component {
    private _enabled = false;
    private _isSetup = false;
    static uuid = "0f5e514e-5c1c-4097-a9cc-6620c2e28378" as const;
    static assemblyTreeName = "AssemblyTree";
    static stationTreeName = "StationTree";

    private _configManager = new ConfigManager<ModelViewerConfiguration>(ModelViewerConfigSchema, 'modelViewerConfig');


    /**
     * Tree is a data structure we create similar to the file strucutre of an .ifc file though typicially we use element properties for robustness to determine groupings such as building steps and assembly
     * you can create a different tree strucutre and use it in other scenarios 
     */
    // private _tree?: Tree<BuildingElement>;
    private _tree?: ViewableTree<IfcElement>;


    private _trees: Map<string, ViewableTree<IfcElement>> = new Map();

    getTree(name: string): ViewableTree<IfcElement> | undefined {
        if (!name) return;
        return this._trees.get(name);
    }

    /**
     * Add a new tree or replace an existing tree based on the name as a key in a map storing the view tree.
     * @returns 
     */
    setTree(tree: ViewableTree<IfcElement>) {
        //const viewableTree = new ViewableTree(treeID, tree, visibilityMap ?? this.createVisibilityMap(tree))

        console.log('setting view Tree', tree.id, tree)
        if (this._trees.has(tree.id)) {
            const oldTree = this._trees.get(tree.id);
            console.log('tree with same name found nd being replaced', tree.id)
            // dispose of tree
        }
        this._trees.set(tree.id, tree);
        return this._trees.get(tree.id);
    }

    /**
     * the selection group defines the group which is actively being used across the software and is typically a building step or station
     * it helps us determine whats important to show the user and whats next and before this group when changing.
     */
    private _selectedGroup?: SelectionGroup;

    /**
     * A collection of building elements that can be changed by other components to prevent specific elements from
     * showing during visibility update. it is the responsibility of the other component to also clear this collection.
     */
    private _additionalHiddenElements: Set<BuildingElement> = new Set();

    /**
     * A collection of building elements that can be changed by other components to prevent specific elements from
     * showing during visibility update. it is the responsibility of the other component to also clear this collection.
     */
    get ExludedElements(): Set<BuildingElement> {
        return this._additionalHiddenElements;
    }

    /**
     * A collection of building elements that can be changed by other components to prevent specific elements from
     * showing during visibility update. it is the responsibility of the other component to also clear this collection.
     */
    set ExludedElements(elementsToExclude: Set<BuildingElement>) {
        this._additionalHiddenElements = elementsToExclude;
    }

    readonly onTreeChanged = new OBC.Event<ViewableTree<IfcElement> | undefined>(); // when the main tree is changed
    readonly onBuildingElementsChanged = new OBC.Event<BuildingElement[]>();
    // readonly afterTreeVisibilityUpdated = new OBC.Event<{ treeID: string }>(); //
    readonly onSelectedGroupChanged = new OBC.Event<SelectionGroup>(); // when the selection group is changed
    readonly onVisibilityModeChanged = new OBC.Event<VisibilityMode>();
    readonly onVisibilityUpdated = new OBC.Event<{ elements: BuildingElement[], treeID: string }>(); // the new elements that are visible after visibility change
    // readonly onVisibilityMapUpdated = new OBC.Event<{ treeID: string }>(); // when a map of a tree is changed trigger event so ui can render change

    readonly onConfigurationChanged = new OBC.Event<ConfigManager<ModelViewerConfiguration>>()

    
    get configuration() {
        return this._configManager;
    }


    get SelectedGroup(): SelectionGroup | undefined {
        return this._selectedGroup;
    }


    // // Add any additional logic needed when setting the selection group
    // }
    /**
         * It is assumed that the selected group has an ID that matches the currently active tree. If this group comes from a tree you ar 
         * not sure is the active tree, first set that tree then select group. If setTree is true then set main tree to inut tree ID if found
         */
    setSelectionGroup(selectionGroup: SelectionGroup | undefined, updateModelVisibility: boolean, treeID: string, setTree: boolean) {
        if (!selectionGroup) return;
        this._selectedGroup = selectionGroup;
        console.log("ModelViewManager: selected group changed:", selectionGroup.id, updateModelVisibility, treeID ?? this.Tree?.id)

        if (updateModelVisibility) {
            this.updateBasedOnVisibilityMode(undefined, undefined, treeID ?? this.Tree?.id);
        }

        if (setTree && this._tree?.id !== treeID) {
            this.setMainTree(treeID);
            console.log("ModelViewManager: selection group forced tree change:", treeID)

        }
        console.log("ModelViewManager: updated:", updateModelVisibility)

        this.onSelectedGroupChanged.trigger(this._selectedGroup)
    }

    /**
     * Assuming the id is found in the current Tree. set the new selection group based on args selectionGroupId and this.Tree
     * @param selectionGroupId the treenode id to search the rpimary tree from
     * @param updateModelVisibility to update the model visibility based on the new selection group
     */
    setSelectionGroupByID(selectionGroupId: string, updateModelVisibility: boolean) {
        const node = this.Tree?.getNode(selectionGroupId);

        if (!node) return;

        this._selectedGroup = { groupType: node.type, id: node.id, groupName: node.name, elements: convertToBuildingElement(TreeUtils.getChildrenNonNullData(node)) };
        console.log("ModelViewManager: selected group changed:", selectionGroupId)

        this.onSelectedGroupChanged.trigger(this._selectedGroup)
        if (updateModelVisibility && this.Tree?.id) {
            this.updateBasedOnVisibilityMode(undefined, undefined, this.Tree?.id);
        }
    }

    /**
     * Get the currently active tree
     */
    get Tree(): ViewableTree<IfcElement> | undefined {
        return this._tree;
    }

    constructor(components: OBC.Components) {
        super(components);

        const frag = components.get(OBC.FragmentsManager)
        frag.onFragmentsDisposed.add((data) => this.cleanUp(data.groupID, data.fragmentIDs))
        this._configManager.addEventListener('configChanged', (event: Event) => {
            console.log('configChanged', event)
            this.onConfigurationChanged.trigger(this._configManager)
        })
    }

    cleanUp = (groupID: string, fragmentIDs: string[]) => {
        console.log('Clean up not implimented for view manager')
    }

    /**
     * search tree strucutre for a node with a name matching the groupID. 
     * @param nodeID name of selection group to search tree
     * @returns undefined or a flat collection of children building elements.
     */
    getBuildingElements = (nodeID: string | undefined, tree: ViewableTree<IfcElement> | undefined): BuildingElement[] | undefined => {
        if (!nodeID || !tree) return;

        const groupNode = tree.getNode(nodeID);

        if (!groupNode) return;

        return convertToBuildingElement(TreeUtils.getChildrenNonNullData(groupNode)) ?? []
    }




    private _stationTreeStructure = [knownProperties.Station, knownProperties.BuildingStep]
    private _AssemblyTreeStructure = [knownProperties.Assembly, knownProperties.BuildingStep]

    set stationTreeStructure(propertyOrder: knownProperties[]) {
        this._stationTreeStructure = propertyOrder;
    }


    /**
     * Sets up Tree strucutre based on building elements properties and ignores the ifc file structure
     */
    setUpDefaultTrees = async (buildingElements: BuildingElement[] | undefined): Promise<void> => {
        if (!buildingElements) {
            this.onTreeChanged.trigger(undefined);
            return;
        }


        try {
            // Await the async tree creation functions
            const [stationTree, assemblyTree] = await Promise.all([
                setUpTreeFromProperties(ModelViewManager.stationTreeName, buildingElements, this._stationTreeStructure),
                setUpTreeFromProperties(ModelViewManager.assemblyTreeName, buildingElements, this._AssemblyTreeStructure)
            ]);

            // Continue the operations after trees are created
            console.log("Tree created:", this._stationTreeStructure, stationTree);
            console.log("Tree created:", this._AssemblyTreeStructure, assemblyTree);

            // Add or replace the created trees
            this.setTree(new ViewableTree(stationTree.id, stationTree));
            this.setTree(new ViewableTree(assemblyTree.id, assemblyTree));

            // Set the active tree
            this.setMainTree(stationTree.id);

            // Reset selected group and enable status
            this._selectedGroup = undefined;
            this._enabled = true;

            // Optional: If visibility update is necessary, you can re-enable it here.
            // this.updateVisibility(tree.id); 

        } catch (error) {
            console.error("Error creating trees:", error);
            // Handle errors appropriately, maybe trigger an error event or log the issue
        }
    }

    /**
     * Set which tree is the main tree for navigation and other features. you must first add
     * the tree using this.addTree. and then you can set it by using the tree name.
     * @param treeID the key to search existing trees
     */
    setMainTree(treeID: string): boolean {
        const newMainTree = this._trees.get(treeID)
        if (!newMainTree) {
            console.log('faile dto set tree as no tree exists with that name. try adding it first', treeID)
            return false;
        }

        this._tree = newMainTree;
        this.onTreeChanged.trigger(this._tree);
        return this._tree !== undefined;
    }

    /**
     * Set the visibility state of a tree node based on state input and tree id if found. 
     * @param treeID 
     * @param nodeID 
     * @param newVisState 
     * @param overrideChildren if true then all children will have the same visibility state applied
     * @returns 
     */
    setVisibilityState = (treeID: string, nodeID: string, newVisState: VisibilityState, overrideChildren: boolean = false) => {

        const cacheVisState = this.getVisibilityState(treeID, nodeID)

        if (cacheVisState === newVisState) return;

        const tree = this.getTree(treeID);

        if (!tree) return;
        this.setNodeVisibilityState(nodeID, treeID, newVisState, false);
        if (overrideChildren) {
            const node = tree.getNode(nodeID);
            if (!node || node.children.size === 0) return;

            const children = TreeUtils.getChildren(node, () => true);
            children.forEach(child => {
                tree.setVisibility(child.id, newVisState)
            })

        }
        // this.afterTreeVisibilityUpdated.trigger({ treeID: treeID });
    };


    getVisibilityState = (treeID: string, nodeID: string): VisibilityState | undefined => {
        if (treeID !== treeID || !nodeID) return;

        const tree = this.getTree(treeID);
        if (!tree) return;

        const visState = tree.getVisibility(nodeID);
        if (!visState) {
            console.log("Error finding vis state for node as no node found in tree", treeID, nodeID);
            return;
        }
        return visState;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    private _visibilityMode: VisibilityMode = VisibilityMode.showPrevious;

    get VisibilityMode(): VisibilityMode {
        return this._visibilityMode;
    }

    /**
     * visibilityMode determines how selected and non selected groupings will be displayed upone next visibility update.
     */
    set VisibilityMode(value: VisibilityMode) {
        // console.log("Visibility mode set:", value)
        this._visibilityMode = value;
        this.onVisibilityModeChanged.trigger(this._visibilityMode);
    }


    /**
     * Using thatOpen OBF.highlighter component to highlight by express ids using the select highlight type. clearing the
     * select highlight collection before making the new selection
     * @param group group to be selected
     * @returns 
     */
    async select(group: SelectionGroup, treeID: string) {
        if (!group.id || !this.components) return;
        console.log("high light these elements")

        const highlighter = this.components.get(OBF.Highlighter);
        const modelCache = this.components.get(ModelCache);

        const tree = this._trees.get(treeID);
        if (!tree) return;
        const node = tree.getNode(group.id);
        if (!node) return;

        const elementsByModelId = new Map<string, BuildingElement[]>();

        const els = TreeUtils.getChildren(node, n => n.data !== null && n.type === KnownGroupType.BuildingElement)
            .reduce((acc: BuildingElement[], node) => {
                if (node.data) {
                    acc = [...acc, ...convertToBuildingElement(node.data)];
                }
                return acc;
            }, [] as BuildingElement[])

        for (const element of els) {
            const groupID = element?.modelID;
            if (!groupID || !element) continue;
            if (!elementsByModelId.has(groupID)) {
                elementsByModelId.set(groupID, []);
            }
            elementsByModelId.get(groupID)!.push(element);
        }

        await highlighter.clear('select');

        const highlightPromises = Array.from(elementsByModelId.entries()).map(async ([modelId, elements]) => {
            const model = modelCache.getModel(modelId);
            if (!model) return;

            const expressIds = elements.flatMap(e => e.expressID);
            const elementTypeIds = model.getFragmentMap(expressIds);
            console.log("high light these elements", elementTypeIds)
            await highlighter.highlightByID("select", elementTypeIds, false, false);
        });


        await Promise.all(highlightPromises);
    }

    /**
     * Run updateVisibility assuming that thee treeID is the current tree if not undefined
     */
    update() {
        if (this._tree)
            this.updateVisibility(this._tree?.id);
    }


    /**
     * sets the view of the 3d elements based on the input viewmode and selection group by making a new view tree. Note it clears the existing view tree
     * @param group group to be selected, if undefined will use the selection group of the View Manager if found
     * @param visibilityMode mode to be used, if undefined will use the visibilityMode of the View Manager if found
     * @returns 
     */
    updateBasedOnVisibilityMode(group: SelectionGroup | undefined, visibilityMode: VisibilityMode | undefined, treeID: string) {
        // console.log('update visibility tree', group, visibilityMode, treeID)

        if (!this._trees.has(treeID)) return;
        const tree = this._trees.get(treeID);
        // console.log('update visibility tree', tree)
        if (!group && this._selectedGroup) group = this._selectedGroup;


        if (!tree || !group) return;
        const node = tree.getNode(group.id);
        if (!node) return;

        if (!visibilityMode && this._visibilityMode)
            visibilityMode = this._visibilityMode;

        if (!node) return;

        // make parent visible 
        this.makeParentsVisible(node, tree);
        // get visible and hidden nodes to later do the same for the children

        switch (visibilityMode) {
            case VisibilityMode.Isolate:
                // every other node except its parent and its self are hidden
                if (!node) {
                    console.log('failed to find node in tree to isolate')
                    return;
                }
                this.isolate(node.id, treeID)
                break;
            case VisibilityMode.selectGroup:
                // do nothing but select and make sure there visible

                break;
            case VisibilityMode.showPrevious:
                this.showNeighborNodes(tree, node.id, true)
                break;
            case VisibilityMode.showNeighbors:
                //every node in its parent is visible, every thing else hidden
                this.showNeighborNodes(tree, node.id, false)
                break;
        }

        console.log('visible stations')

        this.updateVisibility(tree.id);
    }

    makeParentsVisible(node: TreeNode<IfcElement>, tree: ViewableTree<IfcElement>) {
        if (node.parent) {
            // Set the visibility of the current parent node
            this.setNodeVisibilityState(node.parent.id, tree.id, VisibilityState.Visible, false);

            // Recursive call to make the parent of the current parent visible
            this.makeParentsVisible(node.parent, tree);
        }
    }

    /**
     * Search for neighbors of the same type and make all previous neighbors that share a same parent visible.
     * the rest make hidden. this works for any level of the tree.
     * @param tree 
     * @param nodeID 
     * @returns 
     */
    private showNeighborNodes = (tree: ViewableTree<IfcElement>, nodeID: string, showOnlyPrevious: boolean): boolean => {
        if (!tree) return false;
        const visibleNodes: TreeNode<IfcElement>[] = [];
        const hiddenNodes: TreeNode<IfcElement>[] = [];

        // every parent node and children before this parents node are hidden
        const node = tree?.getNode(nodeID);
        if (!node || !node.parent) return false; // its the root or cant be found

        const sameNodeTypes = tree?.getNodes(n => n.type === node?.type)
        if (!sameNodeTypes) return false;

        let nodeFound = false;

        sameNodeTypes.forEach(otherNode => {
            if (otherNode.parent === node.parent && !nodeFound) {
                visibleNodes.push(otherNode);
                if (otherNode === node) nodeFound = true;
            } else if (otherNode.parent === node.parent && !showOnlyPrevious) {
                visibleNodes.push(otherNode)
            } else {
                hiddenNodes.push(otherNode)
            }
        });
        // console.log('visibility of neighbors - hidden', hiddenNodes)
        // console.log('visibility of neighbors - visible', visibleNodes)


        hiddenNodes.forEach(treeNode => {
            tree.setVisibility(treeNode.id, VisibilityState.Hidden)
            const children = TreeUtils.getChildren(treeNode, () => true);
            children.forEach(child => {
                tree.setVisibility(child.id, VisibilityState.Hidden)
            })
        });

        visibleNodes.forEach(treeNode => {
            tree.setVisibility(treeNode.id, VisibilityState.Visible)
            const children = TreeUtils.getChildren(treeNode, () => true);
            children.forEach(child => {
                tree.setVisibility(child.id, VisibilityState.Visible)
            })

            if (treeNode.parent)
                this.makeParentsVisible(treeNode.parent, tree)
        });

        this.updateVisibility(tree.id);
        return true;
    }

    /**
     * Hide every node then unhide the branch of the group
     * @param group 
     * @param treeID 
     * @returns 
     */
    isolate(nodeID: string, treeID: string) {
        if (!nodeID || !this._trees.has(treeID)) return;

        const tree = this._trees.get(treeID);
        if (!tree) return;

        const node = tree?.getNode(nodeID);
        if (!node) {
            console.log('failed to find node in tree to isolate')
            return;
        }
        // hide every node and then unhide the node branch of the group
        tree.visibilityMap.forEach((_, key) => {
            tree.setVisibility(key, VisibilityState.Hidden);
        });

        tree.setVisibility(node.id, VisibilityState.Visible)

        // get all children nodes
        const parents = tree.getParents(node, () => true);
        parents.forEach(parent => {
            tree.setVisibility(parent.id, VisibilityState.Visible)
        })

        // get all children nodes
        const children = TreeUtils.getChildren(node, () => true);
        children.forEach(child => {
            tree.setVisibility(child.id, VisibilityState.Visible)
        })


        // console.log(`Isolating ${nodeID}`)
        // console.log(`Isolating ${nodeID} - children ${children.length}`)


        this.updateVisibility(treeID);
        // this.afterTreeVisibilityUpdated.trigger({ treeID: treeID });
    }

    /**
     * sets new value if key if found matching nodeID. if update is true then 3d scene will update visibility based on change
     * @param nodeId 
     * @param state 
     * @param updateVisibility 
     * @returns 
     */
    setNodeVisibilityState(nodeId: string, treeID: string, state: VisibilityState, updateVisibility: boolean = false) {

        if (!this._trees.has(treeID)) return;

        const visibilityMap = this._trees.get(treeID)?.visibilityMap;
        // if(!visibilityMap) return;


        if (!visibilityMap || !nodeId || !visibilityMap.has(nodeId)) {
            console.log("failed to change visibility,name not found:", nodeId, visibilityMap?.keys())
            return;
        }
        if (visibilityMap.get(nodeId) === state) {
            // console.log("failed to change visibility, state already the same:", visibilityMap.get(nodeId))
            return;
        }
        visibilityMap.set(nodeId, state);
        console.log('vis mode setting', nodeId, state, visibilityMap)

        if (updateVisibility) this.updateVisibility(treeID);
    }

    private SetVisibility(fragments: OBC.FragmentsManager, elements: BuildingElement[] | undefined, visibility: VisibilityState): void {

        if (!elements) return;
        const elementsByModelId = this.groupElementsByModelId(elements);

        //const transWhite = this.white.multiplyScalar(10);
        fragments.groups.forEach(model => {
            const elementsForModel = elementsByModelId.get(model.uuid);
            if (elementsForModel) {
                const allFragments = GetFragmentsFromExpressIds(elementsForModel.map(element => element.expressID), fragments, model);
                if (visibility === VisibilityState.Visible) {
                    console.log('visable', allFragments)
                    allFragments.forEach((ids, frag) => frag.setVisibility(true, ids));
                    // allFragments.forEach((ids, frag) => frag.resetColor(ids));
                }
                else {
                    console.log('hidden', allFragments)

                    allFragments.forEach((ids, frag) => frag.setVisibility(false, ids));
                    // allFragments.forEach((ids, frag) => frag.setColor(transWhite, ids));
                }
            }
        });
    }

    // // if color = true color will be reset to original
    // private SetColor(fragments: OBC.FragmentsManager, elements: BuildingElement[], color: boolean | THREE.Color = false): void {
    //     const elementsByModelId = this.groupElementsByModelId(elements);

    //     fragments.groups.forEach(model => {
    //         const elementsForModel = elementsByModelId.get(model.uuid);
    //         if (elementsForModel) {
    //             const allFragments = GetFragmentsFromExpressIds(elementsForModel.map(element => element.expressID), fragments, model);
    //             if (color === true)
    //                 allFragments.forEach((ids, frag) => frag.resetColor(ids));
    //             else if (color instanceof THREE.Color)
    //                 allFragments.forEach((ids, frag) => frag.setColor(color, ids));
    //         }
    //     });
    // }

    private groupElementsByModelId(elements: BuildingElement[]): Map<string, BuildingElement[]> {
        return elements.reduce((acc, element) => {
            if (!acc.has(element.modelID)) {
                acc.set(element.modelID, []);
            }
            acc.get(element.modelID)!.push(element);
            return acc;
        }, new Map<string, BuildingElement[]>());
    }
    /**
     * Updates visibility of building elements based on selection groups and the Tree of building elements. call this if needing to 
     * manually refresh the visibility state.
     * @returns 
     */
    public updateVisibility = (treeID: string) => {
        if (!this._enabled || !this.components || !this._trees.has(treeID)) return;
        // console.log("Update visibility")

        const tree = this._trees.get(treeID)
        const fragments = this.components.get(OBC.FragmentsManager);

        // if no visibility map found then make everything visible
        if (!tree?.visibilityMap) {
            const elements = this.getBuildingElements(tree?.root.id ?? '', this._tree);
            if (!elements) return;
            this.SetVisibility(fragments, elements, VisibilityState.Visible);
            console.log("hide elements fails, showing all instead")
            this.onVisibilityUpdated.trigger({ elements, treeID });
            return;
        }

        // get all nodes with visible state and convert to building elements
        const visibleElements = convertToBuildingElement(tree.getNodesByVisibility(VisibilityState.Visible).map(node => node.data)
            .filter((data): data is NonNullable<typeof data> => data !== null));

        // get all nodes with hidden state and convert to building elements
        const hiddenNodes = convertToBuildingElement(tree.getNodesByVisibility(VisibilityState.Hidden).map(node => node.data)
            .filter((data): data is NonNullable<typeof data> => data !== null));

        //remove hidden from visible group and add to hidden
        // const filterredVisibles = visibilityTypes?.get(VisibilityState.Visible)?.filter(element => !this._additionalHiddenElements.has(element))
        // if (filterredVisibles)
        //     visibilityTypes?.set(VisibilityState.Visible, filterredVisibles)
        // const newHidden = visibilityTypes?.get(VisibilityState.Hidden)?.filter(element => !this._additionalHiddenElements.has(element))
        // if (newHidden)
        //     visibilityTypes?.get(VisibilityState.Hidden)?.push(...newHidden)
        console.log("Visibility Update - visible", visibleElements.length)
        console.log("Visibility Update - hidden", hiddenNodes.length)
        // console.log("Visibility Update - hidden", hiddenOG)
        this.SetVisibility(fragments, visibleElements, VisibilityState.Visible);
        this.SetVisibility(fragments, hiddenNodes, VisibilityState.Hidden);
        this.onVisibilityUpdated.trigger({ elements: visibleElements, treeID });
    };
}