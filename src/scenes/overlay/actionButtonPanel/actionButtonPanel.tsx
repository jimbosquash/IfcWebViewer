import { Box, Button, ButtonGroup, Divider, Tooltip, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import * as OBC from "@thatopen/components";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { GetAdjacentGroup } from "../../../utilities/BuildingElementUtilities";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { ModelCache } from "../../../bim-components/modelCache";
import { TaskManager } from "../../../bim-components/taskManager";
import { IsolateButton } from "./src/IsolateButton";
import { Icon } from "@iconify/react";
import ShowTagsButton from "../../../components/ShowTagsButton";
import VisibilityModeButton from "./src/visibilityModeButton";
import { useState } from "react";
import { TreeUtils } from "../../../utilities/Tree";

const ActionButtonPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [groupType, setGroupType] = useState<string>();

  const setAdjacentGroup = async (adjacency: "previous" | "next") => {
    console.log();

    const viewManager = components.get(ModelViewManager);

    const current = viewManager.SelectedGroup;

    if (!current) {
      console.log("No group selected, default will be used");
    }
    // console.log("Setting adjacent",current);
    console.log("GetAdjacentGroup to", current);
    const newGroup = GetAdjacentGroup(current, viewManager.Tree, adjacency);
    console.log("next group", current);

    if (newGroup) {
      try {
        if (!viewManager.Tree) return;
        viewManager.SelectedGroup = newGroup;
        viewManager.updateBasedOnVisibilityMode(undefined, undefined, viewManager.Tree.id);
        //zoomToSelected(viewManager.getBuildingElements(newGroup.id),components);
      } catch (error) {
        console.error("Error updating visibility:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    }
  };

  const handleTaskCreate = async () => {
    const taskManager = components.get(TaskManager);
    const cache = components.get(ModelCache);
    if (!taskManager) return;
    const testData = taskManager.getTestData();
    console.log("taskManager", testData);

    if (!testData) return;
    const newIfcFile = await taskManager.setupExistingTasks(0, testData);
  };

  const showAll = () => {
    const hider = components.get(OBC.Hider);

    hider.set(true);
  };

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
      <Box component={"div"}>
        <div
          style={{
            pointerEvents: "auto",
            position: "fixed",
            bottom: 50,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            width: 450,
            height: 35,
            cursor: "grab",
            display: "inline-block",
          }}
        >
          <ButtonGroup variant="contained" style={{ backgroundColor: colors.primary[400], height: "40px" }}>
            
            <Tooltip title={"Navigate Building Steps"}>
              <Button
                // onClick={toggleGroupType}
                style={{ color: colors.grey[200], border: "0" }}
                variant={"outlined"}
              >
                {groupType === "Assembly" ? <Icon icon="solar:box-outline" /> :<Icon icon="ri:shapes-line" />}
              </Button>
            </Tooltip>

            <VisibilityModeButton />
            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
            <Tooltip title="Previous group">
              <Button
                style={{ color: colors.grey[400], border: "0" }}
                variant="contained"
                sx={{
                  backgroundColor: "transparent",
                }}
                onClick={() => setAdjacentGroup("previous")}
              >
                <NavigateBeforeIcon fontSize="large" />
              </Button>
            </Tooltip>
            <Tooltip title="Next group">
              <Button
                style={{ color: colors.grey[400], border: "0" }}
                variant="contained"
                sx={{
                  backgroundColor: "transparent",
                }}
                onClick={() => setAdjacentGroup("next")}
              >
                <NavigateNextIcon fontSize="large" />
              </Button>
            </Tooltip>
            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
            <ShowTagsButton variant="panel" />

            {/* <Button onClick={() => {handleTaskCreate()}}>task</Button>
            <SaveButton data={newIfcFile} filename={"newTaskFile"} /> */}
            <ButtonGroup>
              <IsolateButton />
              <Tooltip title="Show all">
                <Button
                  sx={{ backgroundColor: "transparent" }}
                  onClick={() => showAll()}
                  style={{ color: colors.grey[400], border: "0" }}
                  //   variant={open ? "contained" : "outlined"}
                >
                  <Icon icon="mdi:eye" />
                </Button>
              </Tooltip>
            </ButtonGroup>
            {/* <Tooltip title="Add comment">
              <CommentIconButton />
            </Tooltip> */}
          </ButtonGroup>
        </div>
      </Box>
    </>
  );
};

export default ActionButtonPanel;
