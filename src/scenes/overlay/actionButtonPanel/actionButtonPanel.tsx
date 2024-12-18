import { Box, Button, ButtonGroup, Divider, Tooltip, useTheme } from "@mui/material";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { ModelCache } from "../../../bim-components/modelCache";
import { TaskManager } from "../../../bim-components/taskManager";
import { IsolateButton } from "./src/IsolateButton";
import { Icon } from "@iconify/react";
import ShowTagsButton from "../../../components/ShowTagsButton";
import VisibilityModeButton from "./src/visibilityModeButton";
import NavigationButtonGroup from "./src/navigationButtonGroup";
import FlipButton from "./src/FlipButton";
import LengthDimensionButton from "./src/lengthDimensionButton";
import { ToolBarButton } from "./src/toolbarButton";
import { isolate } from "../../../utilities/BuildingElementUtilities";
import { zoomToVisible } from "../../../utilities/CameraUtilities";
import { tokens } from "../../../theme";

const ActionButtonPanel = () => {
  const components = useComponentsContext();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
          <ButtonGroup variant="contained"
            style={{
              height: "40px",
              backgroundColor: colors.primary[400]
            }}>

            <ToolBarButton
              toolTip="Show all"
              onClick={() => showAll(components)}
              content={<Icon icon="mdi:eye" />}
            />
            <IsolateButton />
            {/* <HideButton /> */}
            <ToolBarButton
              toolTip="Hide Selected"
              onClick={() => hideSelected(components)}
              content={<Icon icon="mdi:eye-off-outline" />}
            />
            <VisibilityModeButton />
            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
            <NavigationButtonGroup />
            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
            <ToolBarButton
              toolTip="Zoom to Visible"
              onClick={() => zoomToVisible(components)}
              content={<Icon icon="material-symbols:zoom-in-map" />
              }
            />

            <ShowTagsButton />
            <FlipButton />
            <LengthDimensionButton />



            {/* <Tooltip title="Add comment">
              <CommentIconButton />
            </Tooltip> */}
            {/* <Button onClick={() => {handleTaskCreate()}}>task</Button>
            <SaveButton data={newIfcFile} filename={"newTaskFile"} /> */}
          </ButtonGroup>
        </div>
      </Box>
    </>
  );
};

async function hideSelected(components: OBC.Components): Promise<void> {
  const highlighter = components.get(OBF.Highlighter);
  const hider = components.get(OBC.Hider);
  const selected = highlighter.selection;
  if (!selected) return;

  // if items selected then isolate those, otherwise isolate selected group
  for (const selectionID of Object.keys(selected)) {
    if (selectionID !== "select") continue;
    let fragmentIdMap = selected[selectionID];
    // console.log(`Selection ID: ${selectionID}, FragmentIdMap:`, fragmentIdMap, Object.values(fragmentIdMap).length);

    if (Object.values(fragmentIdMap).length === 0) {
      const modelViewManager = components.get(ModelViewManager);
      if (modelViewManager.SelectedGroup !== undefined) {
        await isolate(modelViewManager.SelectedGroup.elements, components);
      }
      return;
    }

    await hider.set(false, fragmentIdMap);
    const elements = components.get(ModelCache).getElementByFragmentIdMap(fragmentIdMap);
    if (elements) {
      components.get(ModelViewManager).onVisibilityUpdated.trigger({ elements: [...elements], treeID: '' });
    }
  }
}


function showAll(components: OBC.Components) {
  const viewer = components.get(ModelViewManager);

  if (viewer.SelectedGroup?.id === undefined) {
    const hider = components.get(OBC.Hider);
    hider.set(true);

  } else {
    viewer.isolate(viewer.SelectedGroup?.id, viewer.Tree?.id ?? "")
  }

};

async function handleTaskCreate(components: OBC.Components) {
  const taskManager = components.get(TaskManager);
  if (!taskManager) return;
  const testData = taskManager.getTestData();
  console.log("taskManager", testData);

  if (!testData) return;
  const newIfcFile = await taskManager.setupExistingTasks(0, testData);
};

export default ActionButtonPanel;
