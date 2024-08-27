import { Box, Button, ButtonGroup, Divider, Tooltip, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { tokens } from "../../../theme";
import * as OBC from "@thatopen/components";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { GetAdjacentGroup } from "../../../utilities/BuildingElementUtilities";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { ModelCache } from "../../../bim-components/modelCache";
import { SelectionGroup, VisibilityMode } from "../../../utilities/types";
import CameraButton from "./src/cameraButton";
import { TaskManager } from "../../../bim-components/taskManager";
import { IsolateButton } from "./src/IsolateButton";
import { Icon } from "@iconify/react";
import { VisibilityPropertiesButton } from "./src/visibilityPropertiesButton";
import { PlanViewButton } from "./src/planViewButton";
import SetOrthogonalCamera from "../../../components/SetOrthogonalCamera";
import ShowTagsButton from "../../../components/ShowTagsButton";

interface floatingButtonProps {
  togglePropertyPanelVisibility: () => void;
  toggleGroupsPanelVisibility: () => void;
}

const ActionButtonPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>();
  const [newIfcFile, setnewIfcFile] = useState<Uint8Array>();

  useEffect(() => {
    if (!components) return;

    const viewManager = components.get(ModelViewManager);
    if (!viewManager) return;
    const fragments = components.get(OBC.FragmentsManager);
    const cache = components.get(ModelCache);

    viewManager.onVisibilityModeChanged.add(handelVisibilityModeChange);
    //fragments.onFragmentsLoaded.add((data) => handleLoadedModel(data));
    // cache.onModelAdded.add((data) => handleLoadedModel(data));

    return () => {
      viewManager.onVisibilityModeChanged.remove(handelVisibilityModeChange);
      //fragments.onFragmentsLoaded.remove((data) => handleLoadedModel(data));
      // cache.onModelAdded.remove((data) => handleLoadedModel(data));
    };
  }, [components]);

  const setAdjacentGroup = async (adjacency: "previous" | "next") => {
    console.log();

    const viewManager = components.get(ModelViewManager);

    const current = viewManager.SelectedGroup;

    if (!current) {
      console.log("No group selected, default will be used");
    }
    // console.log("Setting adjacent",current);

    const newGroup = GetAdjacentGroup(current, viewManager.Tree, adjacency);

    if (newGroup) {
      try {
        await updateVisibility(viewManager, newGroup);
        viewManager.SelectedGroup = newGroup;
        //zoomToSelected(viewManager.getBuildingElements(newGroup.id),components);
      } catch (error) {
        console.error("Error updating visibility:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    }
  };

  const updateVisibility = async (viewManager: ModelViewManager, group: SelectionGroup) => {
    try {
      if (viewManager.VisibilityMode === VisibilityMode.Isolate) {
        IsolateSelected(viewManager.components, group);
      }
      if (viewManager.VisibilityMode === VisibilityMode.Passive) {
        viewManager.SequentiallyVisible(group);
        await viewManager.select(group);
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  const handelVisibilityModeChange = () => {
    const viewManager = components?.get(ModelViewManager);
    if (!viewManager) return;

    viewManager.VisibilityMode;
    setVisibilityMode(viewManager.VisibilityMode);
  };

  const IsolateSelected = (components: OBC.Components, selected: SelectionGroup) => {
    const viewManager = components.get(ModelViewManager);
    viewManager.isolate(selected);
  };

  const handleTaskCreate = async () => {
    const taskManager = components.get(TaskManager);
    const cache = components.get(ModelCache);
    if (!taskManager) return;
    const testData = taskManager.getTestData();
    console.log("taskManager", testData);

    if (!testData) return;
    const newIfcFile = await taskManager.setupExistingTasks(0, testData);
    setnewIfcFile(newIfcFile);
  };

  const showAll = () => {
    const hider = components.get(OBC.Hider);

    hider.set(true);
  };

  return (
    <>
      <Box component={"div"}>
        <div
          style={{
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
            <CameraButton />

            <VisibilityPropertiesButton />

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

            <PlanViewButton />
            <SetOrthogonalCamera variant="panel" />
            <ShowTagsButton variant="panel"/>

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
                  <Icon icon="mdi:eye" />{" "}
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

const floatingButtonStyle = {
  display: "flex",
  alignItems: "center",
  padding: "12px",
  fontSize: "small",
};

export default ActionButtonPanel;
