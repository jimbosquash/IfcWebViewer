import { Icon } from "@iconify/react";
import { Button, ToggleButtonGroup, Tooltip, useTheme } from "@mui/material";
import { useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";

export const GroupTypeButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [groupType, setGroupType] = useState<string>();

  const toggleButtonGroup = () => {};
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
        <Button onClick={toggleButtonGroup} style={{ color: colors.grey[200], border: "0" }} variant={"outlined"}>
          {groupType === "Assembly" ? <Icon icon="solar:box-outline" /> : <Icon icon="ri:shapes-line" />}
        </Button>
      </Tooltip>
    </>
  );
};

export default GroupTypeButton;
