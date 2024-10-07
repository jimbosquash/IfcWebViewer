import React, { useMemo } from "react";
import TreeTableRow from "../../../../components/TreeTableRow";
import { TreeNode } from "../../../../utilities/Tree";
import { IfcElement } from "../../../../utilities/types";

// Define props type if necessary
interface MemoizedTreeTableRowsProps {
  nodes: TreeNode<IfcElement>[] | undefined;
  treeName: string;
  visibleOnDoubleClick: boolean;
  nodeVisibility?: Map<string, string>; // Visibility state mapping
  setVisibility?: (nodeId: string, enabled: boolean) => void;
}

const MemoizedTreeTableRows: React.FC<MemoizedTreeTableRowsProps> = ({
  nodes,
  treeName,
  visibleOnDoubleClick,
  nodeVisibility,
  setVisibility,
}) => {
  const memoizedTreeTableRows = useMemo(() => {
    if (!nodes) return null;

    // Function to render a single TreeTableRow
    const renderTreeTableRow = (node: TreeNode<IfcElement>, variant: "Floating" | "Flat" = "Floating") => (
      <TreeTableRow
        key={node.id}
        name={node.name}
        treeID={treeName}
        icon=""
        node={node}
        variant={variant}
        visibleOnDoubleClick={visibleOnDoubleClick}
      >
        {renderChildren(node)}
      </TreeTableRow>
    );

    // Function to render children nodes
    const renderChildren = (node: TreeNode<IfcElement>) => {
      const children = Array.from(node.children.values());

      // if children are building elements dont show them
      const filteredChildren = children.filter((child) => child.type !== "BuildingElement");
      if(filteredChildren.length < 1) {
        console.log('tree display: no children that are not building elements',node.name,filteredChildren)
        return;
      }
      
      // If the second-level node has only one child called "Unspecified", skip it
      if (children[0].name === "Unspecified") {
        console.log('tree display: Children with Unspecified name')
        return renderGrandChildren(children[0]);
      } else {
        // Otherwise, render each child as a new TreeTableRow
        return children.map((child) => renderTreeTableRow(child, "Flat"));
      }
    };

    // Function to render grandchildren nodes
    const renderGrandChildren = (childNode: TreeNode<IfcElement>) => {
      // Filter out children with type "BuildingElement" and render the others
      return childNode.children
        ? Array.from(childNode.children.values())
            .filter((child) => child.type !== "BuildingElement")
            .map((grandChild) => renderTreeTableRow(grandChild, "Flat"))
        : null;
    };

    // Map through the top-level nodes and render the tree structure
    return nodes.map((node) => renderTreeTableRow(node));
  }, [nodes, nodeVisibility, setVisibility, visibleOnDoubleClick, treeName]);

  return <>{memoizedTreeTableRows}</>;
};

export default MemoizedTreeTableRows;
