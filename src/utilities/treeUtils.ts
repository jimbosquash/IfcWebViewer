import { convertToBuildingElement } from "./BuildingElementUtilities";
import { TreeNode } from "./Tree";
import { IfcElement } from "./types";

export class TreeUtils {

    static getBuildingElements = (node: TreeNode<IfcElement>) => {
        return convertToBuildingElement(TreeUtils.getChildrenNonNullData(node))
    }

    /**
     * Recursively search children for nodes that meet the condition
     * @param node 
     * @param condition 
     * @returns 
     */
    static getChildren = <T>(node: TreeNode<T>, condition: (child: TreeNode<T>) => boolean) => {
        // search a treenodes children for a condition 
        const result: TreeNode<T>[] = [];

        const searchChildren = (currentNode: TreeNode<T>) => {
            currentNode.children.forEach((child) => {
                if (condition(child)) {
                    result.push(child);
                }
                // Recursively search grandchildren
                searchChildren(child);
            });
        };

        searchChildren(node);
        return result;
    }  

    // remove nulls
    static getChildrenNonNullData = <T>(node: TreeNode<T>) => {
        // search a treenodes children for a condition 
        const result: TreeNode<T>[] = [];

        const searchChildren = (currentNode: TreeNode<T>) => {
            currentNode.children.forEach((child) => {
                    result.push(child);
                // Recursively search grandchildren
                searchChildren(child);
            });
        };

        searchChildren(node);
        const d = result.map(n => n.data)
        .filter((data): data is NonNullable<typeof data> => data != null)
        .flat();

        return d;
    }  
}
