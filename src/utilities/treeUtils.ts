import { TreeNode } from "./Tree";

type InferTreeNodeType<T> = T extends TreeNode<infer U> ? U : never;


export class TreeUtils {

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



    // static getChildrenOfType = <T, R extends InferTreeNodeType<T>>(
    //     node: TreeNode<T>,
    //     condition: (child: TreeNode<T>) => boolean,
    //     typeGuard: (data: T) => data is R
    //   ): TreeNode<R>[] => {
    //     const result: TreeNode<R>[] = [];
    
    //     const searchChildren = (currentNode: TreeNode<T>) => {
    //       currentNode.children.forEach((child) => {
    //         if (condition(child) && typeGuard(child.data)) {
    //           result.push(child as TreeNode<R>);
    //         }
    //         // Recursively search grandchildren
    //         searchChildren(child);
    //       });
    //     };
    
    //     searchChildren(node);
    //     return result;
    //   }

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
