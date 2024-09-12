import { Icon } from "@iconify/react";
import { Button, ToggleButtonGroup, Tooltip, useTheme } from "@mui/material";
import { useState } from "react";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";
import { TreeNode, TreeUtils } from "../../../../utilities/Tree";
import { BuildingElement, SelectionGroup } from "../../../../utilities/types";

export const GroupTypeButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [groupType, setGroupType] = useState<string>();

  const toggleButtonGroup = () => {};

  const toggleGroupType = () => {
    //get current selected node

    // if child is not type building element then set its first child as the selected group

    const viewManager = components.get(ModelViewManager);
    const current = viewManager.SelectedGroup;
    if (!current) {
      //should select first group 
      return;
    }
    console.log("group type", current.groupType);
    const node = viewManager.Tree?.getNode(current.id);
    if(!node) {
      console.log("failed to change group type due to node not being found in primary tree",current)
      return;
    }

    if(node.isLeaf) {
      // get parent instead
      return;
    }

    const children = [...node.children.entries()];
    let newNode = children.find((value) => value[1].type !== "BuildingElement")?.[1];
    if(!newNode && node.parent?.type !== "Project") {
      newNode = node.parent;

    }
    if(newNode) {
      console.log("current group will change from",node.type," to:", newNode.type)

      viewManager.setSelectionGroup(NodeToSelectionGroup(newNode),true)}

  };

  const NodeToSelectionGroup = (node : TreeNode<BuildingElement>) => {

    const group: SelectionGroup = {
      id: node.id,
      groupType: node.type,
      groupName: node.name,
      elements: TreeUtils.getChildrenNonNullData(node)
    }
    return group;
  }

  // const toggleGroupType = () => {

  //   const viewManager = components.get(ModelViewManager);
  //   const current = viewManager.SelectedGroup;
  //   if(!current) return;
  //   console.log("group type",current.groupType)
  //   const node = viewManager.Tree?.getNode(current.id);

  //   if(current.groupType === "BuildingStep")
  //     setGroupType("Assembly")
  //     if(node?.children) {
  //       const firstChild = [...node?.children.values()][0]
  //       const newGroup =  { groupType: firstChild.type, id: firstChild.id, groupName: firstChild.name, elements: TreeUtils.getChildrenNonNullData(firstChild) };

  //       viewManager.SelectedGroup = newGroup;
  //       if(viewManager.Tree?.id){
  //       viewManager.updateBasedOnVisibilityMode(undefined, undefined, viewManager.Tree.id);}
  //     }

  //     else {
  //       setGroupType("BuildingStep")
  //       if(node?.parent) {
  //         const newGroup =  { groupType: node?.parent.type, id: node?.parent.id, groupName: node?.parent.name, elements: TreeUtils.getChildrenNonNullData(node?.parent) };

  //         viewManager.SelectedGroup = newGroup;
  //         if(viewManager.Tree?.id){
  //         viewManager.updateBasedOnVisibilityMode(undefined, undefined, viewManager.Tree.id);}
  //       }

  //     }

  // }

  return (
    <>
      <Tooltip title={"Navigate Building Steps"}>
        <Button onClick={toggleGroupType} style={{ color: colors.grey[200], border: "0" }} variant={"outlined"}>
          {groupType === "Assembly" ? <Icon icon="solar:box-outline" /> : <Icon icon="ri:shapes-line" />}
        </Button>
      </Tooltip>
    </>
  );
};

export default GroupTypeButton;
