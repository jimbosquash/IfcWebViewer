import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from 'three'
import { setUpTree } from "../../utilities/BuildingElementUtilities";
import { GetFragmentsFromExpressIds } from "../../utilities/IfcUtilities";
import { buildingElement, SelectionGroup, VisibilityMode, VisibilityState } from "../../utilities/types";
import { Tree, TreeNode, TreeUtils } from "../../utilities/Tree";
import { _roots } from "@react-three/fiber";



export class ModelViewManager extends OBC.Component {
    private _enabled = false;
    private _isSetup = false;
    static uuid = "0f5e514e-5c1c-4097-a9cc-6620c2e28378" as const;
    private _tree?: Tree<buildingElement>;
    readonly onTreeChanged = new OBC.Event<Tree<buildingElement> | undefined>();
    readonly onBuildingElementsChanged = new OBC.Event<buildingElement[]>();
    readonly onGroupVisibilitySet = new OBC.Event<Map<string, VisibilityState>>();
    readonly onSelectedGroupChanged = new OBC.Event<SelectionGroup>();
    readonly onVisibilityModeChanged = new OBC.Event<VisibilityMode>();
    private _treeVisibility?: Map<string, VisibilityState>;
    private _selectedGroup?: SelectionGroup;

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

    get Tree(): Tree<buildingElement> | undefined {
        return this._tree;
    }

    constructor(components: OBC.Components) {
        super(components);

        const frag = components.get(OBC.FragmentsManager)
        frag.onFragmentsDisposed.add((data) => this.cleanUp(data.groupID, data.fragmentIDs))
    }

    cleanUp = (groupID: string, fragmentIDs: string[]) => {



    }

    getBuildingElements = (groupId: string): buildingElement[] | undefined => {
        if (!groupId || !this._tree) return;

        const groupNode = this._tree.getNode(groupId);

        if (!groupNode) return;

        return TreeUtils.getChildrenNonNullData(groupNode)
    }

    setUpGroups = (buildingElements: buildingElement[] | undefined, groupVisibility?: Map<string, VisibilityState>): void => {
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

    // visibilityMode determines how selected and non selected groupings will be displayed.
    set VisibilityMode(value: VisibilityMode) {
        // console.log("Visibility mode set:", value)
        this._visibilityMode = value;
        this.onVisibilityModeChanged.trigger(this._visibilityMode);
    }

    // Group Visibility : key = group Name, value = visibility state. will be used to determine the visibility of geometry 
    // when triggering updateVisibility;
    set GroupVisibility(value: Map<string, VisibilityState> | undefined) {
        // console.log("ModelViewManager: group vis being set", value);
        this._treeVisibility = value;
        this.onGroupVisibilitySet.trigger(this._treeVisibility);
        this.updateVisibility();
    }

    // displays all tree nodes before the args node
    SequentiallyVisible(group: SelectionGroup){
        if (!group.id) return;

        const node = this._tree?.getNode(group.id);
        const sameNodeTypes = this._tree?.getNodes(n => n.type === node?.type)
        if (!sameNodeTypes) return;

        const visibleNodes: TreeNode<buildingElement>[] = [];
        const hiddenNodes: TreeNode<buildingElement>[] = [];
        let nodeFound = false;

        sameNodeTypes.forEach(otherNode => {
            if(nodeFound)
            {
                hiddenNodes.push(otherNode)
                return;
            }
            if(otherNode === node)
            {
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
            if(treeNode.parent)
                this.setVisibility(treeNode.parent.id, VisibilityState.Visible, false)

            node?.children.forEach(childNode => { this.setVisibility(childNode.id, VisibilityState.Visible, false) })
        });

        node?.children.forEach(childNode => { this.setVisibility(childNode.id, VisibilityState.Visible, false) })
        this.onGroupVisibilitySet.trigger(this._treeVisibility);
        this.updateVisibility();


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
    setVisibility(id: string, state: VisibilityState, updateVisibility: boolean = false) {

        if (!this._treeVisibility || !id || !this._treeVisibility?.has(id)) {
            console.log("failed to change visibility,name not found:", id, this._treeVisibility?.keys())
            return;
        }
        if (this._treeVisibility.get(id) === state) {
            console.log("failed to change visibility, state already the same:", this._treeVisibility.get(id))
            return;
        }

        this._treeVisibility.set(id, state);

        if (updateVisibility) this.updateVisibility();
    }

    //private white = new THREE.Color(1, 1, 1);

    private SetVisibility(fragments: OBC.FragmentsManager, elements: buildingElement[] | undefined, visibility: VisibilityState): void {

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

    // private setMeshGhost = (fragment: FRAGS.Fragment, ids: number[]): void => {
    //     if (!fragment || !ids) {
    //         console.warn('Invalid model or model has no children');
    //         return;
    //     }

    //     for (const itemID of ids) {
    //         if (!fragment.ids.has(itemID)) {
    //             continue;
    //         }
    //         const instances = fragment.itemToInstances.get(itemID);
    //         if (!instances) {
    //             throw new Error("Instances not found!");
    //         }


    //         for (const instance of new Set(instances)) {
    //             if (!originalsExist) {
    //                 const originalColor = new THREE.Color();
    //                 this.mesh.getColorAt(instance, originalColor);
    //                 originals.set(instance, originalColor);
    //             }

    //             fragment.mesh.setColorAt(instance, color);
    //             fragment.mesh.cust

    //             if (override) {
    //                 originals.set(instance, color);
    //             }
    //         }
    //     }


    //     try {
    //         for (let i = 0; i < model.children.length; i++) {
    //             const child = model.children[i];

    //             if (child instanceof THREE.InstancedMesh) {
    //                 if (child.instanceColor !== null) {
    //                     const oldColor = child.instanceColor.array;

    //                     if (oldColor.length < 3) {
    //                         console.warn(`Invalid color data for child ${i}`);
    //                         continue;
    //                     }
    //                     // console.log("material type:",child.material);
    //                     let mat = child.material as THREE.MeshLambertMaterial;
    //                     mat.side = THREE.DoubleSide;

    //                     // const material = new THREE.MeshStandardMaterial({
    //                     //   color: new THREE.Color(oldColor[0], oldColor[1], oldColor[2]),
    //                     //   side: THREE.DoubleSide
    //                     // });

    //                     // child.material = material;
    //                 } else {
    //                     console.warn(`Child ${i} has no instance color`);
    //                 }
    //             } else {
    //                 console.log(`Child ${i} is not an InstancedMesh`);
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error in setMeshFaceDoubleSided:', error);
    //     }
    // };

    // if color = true color will be reset to original
    private SetColor(fragments: OBC.FragmentsManager, elements: buildingElement[], color: boolean | THREE.Color = false): void {
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

    private groupElementsByModelId(elements: buildingElement[]): Map<string, buildingElement[]> {
        return elements.reduce((acc, element) => {
            if (!acc.has(element.modelID)) {
                acc.set(element.modelID, []);
            }
            acc.get(element.modelID)!.push(element);
            return acc;
        }, new Map<string, buildingElement[]>());
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

    private getAllElements(): buildingElement[] | undefined {
        if (!this._tree?.root.id) return;
        return this.getBuildingElements(this._tree?.root.id);
    }

    // search element tree and group building elements by visibility state of their highest parent node 
    private groupElementsByVisibilityState(): Map<VisibilityState, buildingElement[]> | undefined {

        if (!this._tree || !this._treeVisibility) return undefined;

        // 1. if the parent node is hidden, all children nodes will be hidden
        // 2. if parent node is ghost, children node of type visible and ghost will be ghost, and hidden remains hidden
        // 3. if parent node is visble nothing changes 

        const result = new Map<VisibilityState, buildingElement[]>();
        result.set(VisibilityState.Visible, []);
        result.set(VisibilityState.Hidden, []);
        result.set(VisibilityState.Ghost, []);


        const traverseNode = (node: TreeNode<buildingElement>, parentState: VisibilityState) => {

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