import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import * as THREE from 'three'
import { setUpTreeFromProperties } from "../../utilities/BuildingElementUtilities";
import { GetFragmentsFromExpressIds } from "../../utilities/IfcUtilities";
import { BuildingElement, knownProperties, SelectionGroup, VisibilityMode, VisibilityState } from "../../utilities/types";
import { Tree, TreeNode } from "../../utilities/Tree";
import { _roots } from "@react-three/fiber";
import { ModelCache } from "../modelCache";
import { TreeUtils } from "../../utilities/treeUtils";

interface TreeContainer {
    id: string; // name of tree
    tree: Tree<BuildingElement>;
    visibilityMap: Map<string, VisibilityState>; // key = every node name, value = visibility mode
}


export class ModelViewManager extends OBC.Component {
    private _enabled = false;
    private _isSetup = false;
    static uuid = "0f5e514e-5c1c-4097-a9cc-6620c2e28378" as const;
    static defaultyTreeName = "AssemblyTree";

    /**
     * Tree is a data structure we create similar to the file strucutre of an .ifc file though typicially we use element properties for robustness to determine groupings such as building steps and assembly
     * you can create a different tree strucutre and use it in other scenarios 
     */
    // private _tree?: Tree<BuildingElement>;
    private _tree?: TreeContainer;


    private _trees: Map<string, TreeContainer> = new Map();

    getViewTree(name: string): TreeContainer | undefined {
        if (!name) return;
        return this._trees.get(name);
    }

    /**
     * Get the visibility map of the treeID if existing. after editing visibility Map fire the OnVisibilityMap event 
     * so components can update state.
     * @param treeID 
     * @returns 
     */
    getVisibilityMap(treeID: string) {
        const tree = this.getViewTree(treeID);
        if (tree) return tree.visibilityMap;
    }

    /**
     * Add a new tree or replace an existing tree based on the name as a key in a map storing the view tree.
     * @returns 
     */
    addOrReplaceTree(treeID: string, tree: Tree<BuildingElement>, visibilityMap: Map<string, VisibilityState> | undefined = undefined) {
        const treeContainer = {
            id: treeID,
            tree: tree,
            visibilityMap: visibilityMap ?? this.createVisibilityMap(tree)
        }

        console.log('setting view Tree', treeID, visibilityMap, tree)
        this._trees.set(treeID, treeContainer);
        return treeContainer;
    }

    private createVisibilityMap(tree: Tree<BuildingElement>) {
        return tree.getNodes(node => node.type !== "BuildingElement").reduce((map, treeNode) => {
            map.set(treeNode.id, VisibilityState.Visible)
            return map;
        }, new Map<string, VisibilityState>());
    }

    /**
     * tree visibiliy is a map/dictionary of every node in a tree and stores the visibility state of eachnode. if a parent node is hidden this can be helpful to decide how to treat children nodes
     * you can create other visibility maps to suit other purposes such as materaial grouping
     */
    private _treeVisibility() {
        return this._tree?.visibilityMap;
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

    readonly onTreeChanged = new OBC.Event<Tree<BuildingElement> | undefined>();
    readonly onBuildingElementsChanged = new OBC.Event<BuildingElement[]>();
    readonly onGroupVisibilitySet = new OBC.Event<{ treeID: string, visibilityMap: Map<string, VisibilityState> }>();
    readonly onSelectedGroupChanged = new OBC.Event<SelectionGroup>();
    readonly onVisibilityModeChanged = new OBC.Event<VisibilityMode>();
    readonly onVisibilityUpdated = new OBC.Event<BuildingElement[]>();
    readonly onVisibilityMapUpdated = new OBC.Event<{ treeID: string }>(); // when a map of a tree is changed triiger event so ui can render change



    get SelectedGroup(): SelectionGroup | undefined {
        return this._selectedGroup;
    }

    /**
     * It is assumed that the selected group has an ID that matches the currently active tree. If this group comes from a tree you ar 
     * not sure is the active tree, first set that tree then select group.
     */
    // set SelectedGroup(selectionGroup: SelectionGroup | undefined) {
    //     if (!selectionGroup) return;
    //     this._selectedGroup = selectionGroup;
    //     console.log("ModelViewManager: selected group changed:", selectionGroup.id)
    //     this.onSelectedGroupChanged.trigger(this._selectedGroup)



    // // Add any additional logic needed when setting the selection group
    // }
    /**
         * It is assumed that the selected group has an ID that matches the currently active tree. If this group comes from a tree you ar 
         * not sure is the active tree, first set that tree then select group.
         */
    setSelectionGroup(selectionGroup: SelectionGroup | undefined, updateModelVisibility: boolean) {
        if (!selectionGroup) return;
        this._selectedGroup = selectionGroup;
        console.log("ModelViewManager: selected group changed:", selectionGroup.id)
        this.onSelectedGroupChanged.trigger(this._selectedGroup)
        if (updateModelVisibility && this.Tree?.id) {
            this.updateBasedOnVisibilityMode(undefined, undefined, this.Tree?.id);
        }
    }

    /**
     * Assuming the id is found in the current Tree. set the new selection group based on args selectionGroupId and this.Tree
     * @param selectionGroupId the treenode id to search the rpimary tree from
     * @param updateModelVisibility to update the model visibility based on the new selection group
     */
    setSelectionGroupByID(selectionGroupId: string, updateModelVisibility: boolean) {
        const node = this.Tree?.getNode(selectionGroupId);

        if (!node) return;

        this._selectedGroup = { groupType: node.type, id: node.id, groupName: node.name, elements: TreeUtils.getChildrenNonNullData(node) };
        console.log("ModelViewManager: selected group changed:", selectionGroupId)

        this.onSelectedGroupChanged.trigger(this._selectedGroup)
        if (updateModelVisibility && this.Tree?.id) {
            this.updateBasedOnVisibilityMode(undefined, undefined, this.Tree?.id);
        }
    }

    get Tree(): Tree<BuildingElement> | undefined {
        return this._tree?.tree;
    }

    constructor(components: OBC.Components) {
        super(components);

        const frag = components.get(OBC.FragmentsManager)
        frag.onFragmentsDisposed.add((data) => this.cleanUp(data.groupID, data.fragmentIDs))
    }

    cleanUp = (groupID: string, fragmentIDs: string[]) => { }

    /**
     * search tree strucutre for a node with a name matching the groupID. 
     * @param groupId name of selection group to search tree
     * @returns undefined or a flat collection of children building elements.
     */
    getBuildingElements = (groupId: string, tree: Tree<BuildingElement>): BuildingElement[] | undefined => {
        if (!groupId || !tree) return;

        const groupNode = tree.getNode(groupId);

        if (!groupNode) return;

        return TreeUtils.getChildrenNonNullData(groupNode)
    }




    private _defaultTreeStructure = [knownProperties.Assembly, knownProperties.BuildingStep]

    set defaultTreeStructure(propertyOrder: knownProperties[]) {
        this._defaultTreeStructure = propertyOrder;
    }


    /**
     * Sets up Tree strucutre based on building elements properties and ignores the ifc file structure
     */
    setUpDefaultTree = (buildingElements: BuildingElement[] | undefined): void => {
        if (!buildingElements) {
            this.onTreeChanged.trigger(undefined);
            return;
        }

        const tree = setUpTreeFromProperties(ModelViewManager.defaultyTreeName, buildingElements, this._defaultTreeStructure);

        console.log("tree created:", this._defaultTreeStructure, tree)
        this.addOrReplaceTree(tree.id, tree)
        this.setTree(tree.id)
        this._selectedGroup = undefined;
        this._enabled = true;
        // this.updateVisibility(tree.id); // this is slow and the model should already be visible as this is used on opening by default
    }

    /**
     * Set which tree is the main tree for navigation and other features. you must first add
     * the tree using this.addTree. and then you can set it by using the tree name.
     * @param treeName the key to search existing trees
     */
    setTree(treeName: string): boolean {
        const newMainTree = this._trees.get(treeName)
        if (!newMainTree) {
            console.log('faile dto set tree as no tree exists with that name. try adding it first', treeName)
            return false;
        }

        this._tree = newMainTree;
        this.onTreeChanged.trigger(this._tree.tree);
        if (!this._tree.visibilityMap) return false;
        this.onGroupVisibilitySet.trigger({ treeID: this._tree.id, visibilityMap: this._tree.visibilityMap });
        return true;
    }


    get GroupVisibility(): Map<string, VisibilityState> | undefined {
        return this._treeVisibility();
    }

    get enabled(): boolean {
        return this._enabled;
    }

    private _visibilityMode: VisibilityMode = VisibilityMode.Isolate;

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
     * Group Visibility : key = group Name, value = visibility state. will be used to determine the visibility of geometry 
     * when triggering updateVisibility;
     */
    set GroupVisibility(value: Map<string, VisibilityState> | undefined) {
        // console.log("ModelViewManager: group vis being set", value);
        if (this._tree?.visibilityMap && value !== undefined) {
            const tree = this._trees.get(this._tree.id)
            if (!tree) return;
            tree.visibilityMap = value;
            this.onGroupVisibilitySet.trigger({ treeID: tree.id, visibilityMap: tree.visibilityMap });
            this.updateVisibility(tree.id);
        }
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
        const node = tree.tree.getNode(group.id);
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
     * sets the view of the 3d elements based on the input viewmode and selection group. Note it clears the existing view tree
     * @param group group to be selected, if undefined will use the selection group of the View Manager if found
     * @param visibilityMode mode to be used, if undefined will use the visibilityMode of the View Manager if found
     * @returns 
     */
    updateBasedOnVisibilityMode(group: SelectionGroup | undefined, visibilityMode: VisibilityMode | undefined, treeID: string) {
        if (!group && this._selectedGroup) group = this._selectedGroup;
        if (!visibilityMode && this._visibilityMode) visibilityMode = this._visibilityMode;
        if (!group || !visibilityMode || !this._trees.has(treeID)) return;
        console.log('update visibility', visibilityMode, group.id)

        const tree = this._trees.get(treeID);
        if (!tree) return;

        const node = tree.tree.getNode(group.id);
        // get all nodes of the same type as they will be the equal level in the tree 
        const sameNodeTypes = tree.tree.getNodes(n => n.type === node?.type)
        if (!node || !sameNodeTypes) return;

        // make parent visible // note: should be recursive in future
        if (node?.parent)
            this.setVisibility(node.parent.id, tree.tree.id, VisibilityState.Visible, false)

        // get visible and hidden nodes to later do the same for the children

        switch (visibilityMode) {
            case VisibilityMode.Isolate:
                // every other node except its parent and its self are hidden
                sameNodeTypes.forEach(treeNode => {
                    const visibilityState = treeNode.id === group?.id ? VisibilityState.Visible : VisibilityState.Hidden;

                    if (visibilityState === VisibilityState.Visible) {
                        console.log("Isolation view updating", treeNode)
                        this.setVisibility(treeNode.id, tree.tree.id, VisibilityState.Visible, false)
                        treeNode.children.forEach(child => {
                            if (!child.isLeaf) {
                                console.log("Isolation child", child)

                                this.setVisibility(child.id, tree.tree.id, VisibilityState.Visible, false)
                            } else {
                                console.log('not isolating child', child)
                            }
                        })

                    } else {
                        this.setVisibility(treeNode.id, tree.tree.id, VisibilityState.Hidden, false)
                    }
                });
                break;
            case VisibilityMode.selectGroup:
                // do nothing but select and make sure there visible

                break;
            case VisibilityMode.showPrevious:
                this.showNeighborNodes(tree.tree, node.id, true)
                break;
            case VisibilityMode.showNeighbors:
                //every node in its parent is visible, every thing else hidden
                this.showNeighborNodes(tree.tree, node.id, false)
                break;
        }

        // now go and make sure all children of vis are vis and that all parents are visible
        // make each node, their parent and children are visible

        console.log('visibility mode updating', tree.tree.id)
        this.onGroupVisibilitySet.trigger({ treeID: tree.tree.id, visibilityMap: tree.visibilityMap });
        this.onVisibilityMapUpdated
        this.updateVisibility(tree.id);
    }

    /**
     * Search for neighbors of the same type and make all previous neighbors that share a same parent visible.
     * the rest make hidden. this works for any level of the tree.
     * @param tree 
     * @param nodeID 
     * @returns 
     */
    private showNeighborNodes = (tree: Tree<BuildingElement>, nodeID: string, showOnlyPrevious: boolean): boolean => {
        if (!tree) return false;
        const visibleNodes: TreeNode<BuildingElement>[] = [];
        const hiddenNodes: TreeNode<BuildingElement>[] = [];
        // every parent node and children before this parents node are hidden

        const node = tree?.getNode(nodeID);
        if (!node || !node.parent) return false; // its the root or cant be found
        // console.log('Show previous Neighbors of:', node)

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

        hiddenNodes.forEach(treeNode => {
            this.setVisibility(treeNode.id, tree.id, VisibilityState.Hidden, false)
        });
        // console.log('all hidden nodes found:', hiddenNodes)

        // make each node, their parent and children are visible
        console.log('visible nodes of tree', visibleNodes)
        visibleNodes.forEach(treeNode => {

            this.setVisibility(treeNode.id, tree.id, VisibilityState.Visible, false)

            // now set all their children visible
            treeNode.children.forEach(child => {
                if (!child.isLeaf) {
                    this.setVisibility(child.id, tree.id, VisibilityState.Visible, false)
                }
            })


            if (treeNode.parent)
                this.setVisibility(treeNode.parent.id, tree.id, VisibilityState.Visible, false)

            node?.children.forEach(childNode => { this.setVisibility(childNode.id, tree.id, VisibilityState.Visible, false) })
        });

        return true;
    }


    isolate(group: SelectionGroup, treeID: string) {
        if (!group.id || !this._trees.has(treeID)) return;

        const tree = this._trees.get(treeID);
        if (!tree) return;

        const node = tree?.tree.getNode(group.id);
        const sameNodeTypes = tree?.tree.getNodes(n => n.type === node?.type)
        if (!sameNodeTypes) return;

        sameNodeTypes.forEach(treeNode => {
            this.setVisibility(treeNode.id, tree.id, treeNode.id === group.id ? VisibilityState.Visible : VisibilityState.Hidden, false)
        });

        // make parent visible // note: should be recursive in future
        if (node?.parent)
            this.setVisibility(node.parent.id, treeID, VisibilityState.Visible, false)

        console.log('geting children of isolated node', node?.children)
        node?.children.forEach(childNode => { this.setVisibility(childNode.id, treeID, VisibilityState.Visible, false) })
        this.onGroupVisibilitySet.trigger({ treeID: treeID, visibilityMap: tree?.visibilityMap ?? new Map });
        this.updateVisibility(treeID);
    }

    /**
     * sets new value if key if found matching groupname. if update is true then 3d scene will update visibility based on change
     * @param nodeId 
     * @param state 
     * @param updateVisibility 
     * @returns 
     */
    setVisibility(nodeId: string, treeID: string, state: VisibilityState, updateVisibility: boolean = false) {

        if (!this._trees.has(treeID)) return;

        const visibilityMap = this._trees.get(treeID)?.visibilityMap;
        // if(!visibilityMap) return;


        if (!visibilityMap || !nodeId || !visibilityMap.has(nodeId)) {
            console.log("failed to change visibility,name not found:", nodeId, visibilityMap?.keys())
            return;
        }
        if (visibilityMap.get(nodeId) === state) {
            //console.log("failed to change visibility, state already the same:", this._treeVisibility.get(nodeId))
            return;
        }
        visibilityMap.set(nodeId, state);

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
    /**
     * Updates visibility of building elements based on selection groups and the Tree of building elements. call this if needing to 
     * manually refresh the visibility state.
     * @returns 
     */
    public updateVisibility = (treeID: string) => {
        if (!this._enabled || !this.components || !this._trees.has(treeID) || this.Tree?.id !== treeID) return;
        console.log("Update visibility")

        const treeContainer = this._trees.get(treeID)

        const fragments = this.components.get(OBC.FragmentsManager);
        if (!treeContainer?.visibilityMap) {
            const allElements = this.getAllElements();
            this.SetVisibility(fragments, allElements, VisibilityState.Visible);
            console.log("hide elements fails, showing all instead")
            this.onVisibilityUpdated.trigger(allElements);
            return;
        }

        const visibilityTypes = this.groupElementsByVisibilityState(treeContainer.tree, treeContainer.visibilityMap);
        if (visibilityTypes) {

            //remove hidden from visible group and add to hidden
            // const filterredVisibles = visibilityTypes?.get(VisibilityState.Visible)?.filter(element => !this._additionalHiddenElements.has(element))
            // if (filterredVisibles)
            //     visibilityTypes?.set(VisibilityState.Visible, filterredVisibles)
            // const newHidden = visibilityTypes?.get(VisibilityState.Hidden)?.filter(element => !this._additionalHiddenElements.has(element))
            // if (newHidden)
            //     visibilityTypes?.get(VisibilityState.Hidden)?.push(...newHidden)
            console.log("Visibility Update", visibilityTypes)
            this.SetVisibility(fragments, visibilityTypes.get(VisibilityState.Visible), VisibilityState.Visible);
            this.SetVisibility(fragments, visibilityTypes.get(VisibilityState.Hidden), VisibilityState.Hidden);
            this.SetVisibility(fragments, visibilityTypes.get(VisibilityState.Ghost), VisibilityState.Ghost);
            this.onVisibilityUpdated.trigger(visibilityTypes?.get(VisibilityState.Visible));
        }

    };

    private getAllElements(): BuildingElement[] | undefined {
        if (!this._tree?.tree.root.id) return;
        return this.getBuildingElements(this._tree?.tree.root.id, this._tree?.tree);
    }

    /**
     * Search element tree and group building elements by visibility state of their highest parent node 
     * @param tree 
     * @param visibilityMap 
     * @returns 
     */
    private groupElementsByVisibilityState(tree: Tree<BuildingElement>, visibilityMap: Map<string, VisibilityState>): Map<VisibilityState, BuildingElement[]> | undefined {

        if (!tree || !visibilityMap) return undefined;

        // 1. if the parent node is hidden, all children nodes will be hidden
        // 2. if parent node is ghost, children node of type visible and ghost will be ghost, and hidden remains hidden
        // 3. if parent node is visble nothing changes 

        const result = new Map<VisibilityState, BuildingElement[]>();
        result.set(VisibilityState.Visible, []);
        result.set(VisibilityState.Hidden, []);
        result.set(VisibilityState.Ghost, []);
        // console.log('nodeVisibilityState', visibilityMap)


        const traverseNode = (node: TreeNode<BuildingElement>, parentState: VisibilityState) => {

            if (!tree || !visibilityMap) return undefined;

            const nodeVisibility = visibilityMap.get(node.id) || parentState;

            if (node.isLeaf) {
                // This is a building element node
                switch (nodeVisibility) {
                    case VisibilityState.Hidden:
                        console.log("nodeVisibility Set to Hidden")
                        result.get(VisibilityState.Hidden)!.push(node.data!);
                        break;
                    case VisibilityState.Ghost:
                        result.get(VisibilityState.Ghost)!.push(node.data!);
                        break;
                    case VisibilityState.Visible:
                        result.get(VisibilityState.Visible)!.push(node.data!);
                        break;
                }
            } else if (nodeVisibility === VisibilityState.Hidden) {
                // if this container is hidden then everthing bellow it is also hidden
                const allBuildingElements = TreeUtils.getChildrenNonNullData(node);
                allBuildingElements.forEach(element => result.get(VisibilityState.Hidden)!.push(element));

            } else {
                // This is a container node, traverse its children
                node.children.forEach(child => {
                    let childState = nodeVisibility;
                    if (nodeVisibility === VisibilityState.Ghost &&
                        visibilityMap.get(child.id) === VisibilityState.Visible) {
                        childState = VisibilityState.Ghost;
                    }
                    traverseNode(child, childState);
                });
            }


        };

        // Start traversal from the root
        traverseNode(tree.root!, VisibilityState.Visible);
        // console.log("vis state grouped",result)
        // console.log('nodeVisibilityState set', result)
        return result;
    }
}