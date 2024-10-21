import { Tree, TreeNode } from "../../../utilities/Tree";
import { VisibilityState, KnownGroupType } from "../../../utilities/types";

export class ViewableTree<T> {
    private _id: string; // name of tree
    private tree: Tree<T>;
    private _visibilityMap: Map<string, VisibilityState>; // key = every nodeID, value = visibility mode

    get visibilityMap() {return this._visibilityMap;}
    get id() { return this._id; }
    get root() {return this.tree.root}

    /**
     * 
     * @param id tree Id
     * @param tree pre created tree
     * @param visibilityMap existing visibility map or a full map will be generated using all nodes
     */
    constructor(id: string, tree: Tree<T>, visibilityMap?: Map<string, VisibilityState>) {
        // Initialize the core Tree instance and the visibility map
        this._id = id;
        this.tree = tree;
        this._visibilityMap = visibilityMap ?? this.createVisibilityMap(tree); // todo: should create full map not empty
        console.log('viewable tree vis map created', this._visibilityMap)

        // By default, set the root node's visibility to Visible
        this._visibilityMap.set(tree.root.id, VisibilityState.Visible);
    }

    /**
     * Adds a new node to the tree and sets its visibility to Visible by default.
     */
    addNode(parentId: string, id: string, name: string, type: string, data: T | null = null, isLeaf: boolean = false): void {
        // Add the node to the core tree structure
        this.tree.addNode(parentId, id, name, type, data, isLeaf);

        // Add the node to the visibility map, defaulting to Visible
        this._visibilityMap.set(id, VisibilityState.Visible);
    }

    /**
    * Removes a node from the tree and ensures it is also removed from the visibility map.
    */
    removeNode(id: string): void {
        // Remove the node from the core tree
        this.tree.removeNode(id);

        // Also remove the visibility state entry for that node
        this._visibilityMap.delete(id);
    }

    /**
     * Set the visibility state of a node.
     */
    setVisibility(id: string, state: VisibilityState): void {
        if (!this._visibilityMap.has(id)) {
            console.log('visibility map', this._visibilityMap)
            throw new Error(`Node with id ${id} does not exist in the visibility map`);
        }
        this._visibilityMap.set(id, state);
    }

    /**
   * Get the visibility state of a node.
   */
    getVisibility(id: string): VisibilityState | undefined {
        return this._visibilityMap.get(id);
    }

    /**
 * Get all nodes in the tree that match the given visibility state.
 */
    getNodesByVisibility(state: VisibilityState): TreeNode<T>[] {
        const result: TreeNode<T>[] = [];
        this._visibilityMap.forEach((nodeState, nodeId) => {
            if (nodeState === state) {
                const node = this.tree.getNode(nodeId);
                if (node) result.push(node);
            }
        });
        return result;
    }

    /**
     * Returns all parent nodes of the given node until the root that satisfy a condition.
     * @param node - The starting node to traverse upwards from.
     * @param condition - A function that takes a TreeNode and returns a boolean indicating if the node should be included.
     * @returns Array of parent nodes that match the condition.
     */
    getParents(node: TreeNode<T>, condition: (node: TreeNode<T>) => boolean): TreeNode<T>[] {
        return this.tree.getParents(node,condition)
    }


    /**
* Find nodes in the tree based on a custom condition (similar to the `Tree` class).
*/
    getNodes(predicate: (node: TreeNode<T>) => boolean): TreeNode<T>[] {
        return this.tree.getNodes(predicate);
    }

    /**
* Find nodes in the tree based on a custom condition (similar to the `Tree` class).
*/
    getNode(nodeID: string): TreeNode<T> | undefined {
        return this.tree.getNode(nodeID);
    }

    getFirstOrUndefinedNode(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | undefined {
        return this.tree.getFirstOrUndefinedNode(predicate)
    }

    /**
     * Duplicate the ViewableTree, ensuring that both the tree structure and the visibility map are copied.
     */
    duplicate(): ViewableTree<T> {
        // Duplicate the underlying tree
        const duplicatedTree = this.tree.duplicate();

        // Create a new ViewableTree instance with the duplicated tree
        const newViewableTree = new ViewableTree<T>(duplicatedTree.id, duplicatedTree, new Map(this._visibilityMap));

        // // Manually copy over the visibility map
        // this.visibilityMap.forEach((visibilityState, nodeId) => {
        //     newViewableTree.visibilityMap.set(nodeId, visibilityState);
        // });

        return newViewableTree;
    }

    /**
     * Creates a clean visibility map with a key of every node in a tree except for building element types
     * @param tree 
     * @returns 
     */
    private createVisibilityMap(tree: Tree<T>) {
        return tree.getFlatTreeNodes().reduce((map, treeNode) => {
            map.set(treeNode.id, VisibilityState.Visible)
            return map;
        }, new Map<string, VisibilityState>());
    }

}