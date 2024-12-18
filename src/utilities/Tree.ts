export interface TreeNode<T> {
    id: string; // uniuqe id for node map
    name: string // name to support container nodes eg "station WS01"
    type: string;  // New property
    data: T | null; //
    children: Map<string, TreeNode<T>>;
    parent?: TreeNode<T>;
    isLeaf: boolean; // used to indicate that a node is intentionally a leaf for example building elements
}




export class Tree<T> {
    private _id: string;
    private _root: TreeNode<T>;
    private _nodeMap: Map<string, TreeNode<T>> = new Map(); // key = id

    get id() { return this._id }

    get root(): TreeNode<T> { return this._root }

    /**
     * 
     * @param id 
     * @param rootId use root id to create a single root node for tree. typically project 
     * @param rootType the ifc type that the root is, typically project
     */
    constructor(id: string, rootId: string, rootType: string) {
        this._root = this.createNode(rootId, rootId, rootType, null, false);
        this._id = id;
    }

    private createNode(id: string, name: string, type: string, data: T | null, isLeaf: boolean, parent?: TreeNode<T>): TreeNode<T> {
        const node: TreeNode<T> = { id, name, type, data, children: new Map(), parent, isLeaf };
        this._nodeMap.set(id, node);
        return node;
    }

    addNode(parentId: string, id: string, name: string, type: string, data: T | null = null, isLeaf: boolean = false): void {
        const parentNode = this._nodeMap.get(parentId);
        if (!parentNode) throw new Error(`Parent node ${parentId} not found`);
        if (parentNode.isLeaf) throw new Error(`Cannot add child to leaf node ${parentId}`);
        const newNode = this.createNode(id, name, type, data, isLeaf, parentNode);
        parentNode.children.set(id, newNode);
    }

    // ... other methods ...

    // New method to find nodes by type
    findNodesByType(type: string): TreeNode<T>[] {
        return this.getNodes(node => node.type === type);
    }

    // New method to find leaf nodes of a specific type
    findLeafNodesByType(type: string): TreeNode<T>[] {
        return this.getNodes(node => node.isLeaf && node.type === type);
    }


    getNodes(predicate: (node: TreeNode<T>) => boolean): TreeNode<T>[] {
        const result: TreeNode<T>[] = [];

        const traverse = (node: TreeNode<T>) => {
            if (predicate(node)) {
                result.push(node);
            }
            node.children.forEach(child => traverse(child));
        };

        traverse(this._root);
        return result;
    }

    getFirstOrUndefinedNode(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | undefined {
        let result: TreeNode<T> | undefined = undefined;
        let traverseSuccessful = false;

        const traverse = (node: TreeNode<T>) => {
            // console.log('traversing', node, predicate(node));
            if (traverseSuccessful) return true;

            if (predicate(node)) {
                result = node;
                traverseSuccessful = true;
                return true; // Exit early by returning true
            }
            node.children.forEach(child => traverse(child));
        };

        traverse(this._root);
        return result;
    }

    getFlatTreeNodes(): TreeNode<T>[] {
        const flatNodes: TreeNode<T>[] = [];

        const traverse = (node: TreeNode<T>) => {
            flatNodes.push(node);
            node.children.forEach(child => traverse(child));
        };

        traverse(this._root);
        return flatNodes;
    }


    getNode(id: string): TreeNode<T> | undefined {
        return this._nodeMap.get(id);
    }

    removeNode(id: string): void {
        const node = this._nodeMap.get(id);
        if (!node) return;  // Node doesn't exist, nothing to do

        if (node.parent) {
            node.parent.children.delete(node.id);
        }

        // Recursively remove all children
        node.children.forEach((child, childId) => {
            this.removeNode(childId);
        });

        // Remove this node from the nodeMap
        this._nodeMap.delete(id);
        // console.log('tree node deleted', id, this._id)
    }


    /**
     * Duplicates the tree structure, copying data as reference and not duplicating its.
     * It returns a new Tree with the same structure.
     */
    duplicate(): Tree<T> {
        // Create a new tree with the same root node details, but no data
        const newTree = new Tree<T>(this._id, this._root.id, this._root.type);

        // Helper function to recursively copy nodes
        const copyNode = (originalNode: TreeNode<T>, parentNode: TreeNode<T> | undefined) => {
            // Create a new node in the new tree without copying the data
            const newNode = newTree.createNode(
                originalNode.id,
                originalNode.name,
                originalNode.type,
                originalNode.data, // Do not copy data
                originalNode.isLeaf,
                parentNode
            );

            if (parentNode !== undefined)
                parentNode.children.set(originalNode.id, newNode); // Set the parent in the new tree
            else {
                newTree._root = newNode;
            }

            // Recursively copy the children
            originalNode.children.forEach((child) => {
                copyNode(child, newNode); // Copy each child with the new parent
            });
        };

        // Start copying from the root
        copyNode(this._root, undefined);

        return newTree;
    }


    /**
     * Returns all parent nodes of the given node until the root that satisfy a condition.
     * @param node - The starting node to traverse upwards from.
     * @param condition - A function that takes a TreeNode and returns a boolean indicating if the node should be included.
     * @returns Array of parent nodes that match the condition.
     */
    getParents(node: TreeNode<T>, condition: (node: TreeNode<T>) => boolean): TreeNode<T>[] {
        const parents: TreeNode<T>[] = [];
        let currentNode: TreeNode<T> | undefined = node.parent;

        while (currentNode) {
            if (condition(currentNode)) {
                parents.push(currentNode);
            }
            currentNode = currentNode.parent;
        }

        return parents;
    }
}

