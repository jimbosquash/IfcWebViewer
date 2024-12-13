import { Box, Button, ButtonGroup, Divider, Tooltip, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import * as OBC from "@thatopen/components";
import { GetAdjacentGroup } from "../../../utilities/BuildingElementUtilities";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { ModelCache } from "../../../bim-components/modelCache";
import { TaskManager } from "../../../bim-components/taskManager";
import { IsolateButton } from "./src/IsolateButton";
import { Icon } from "@iconify/react";
import ShowTagsButton from "../../../components/ShowTagsButton";
import VisibilityModeButton from "./src/visibilityModeButton";
import GroupTypeButton from "./src/groupTypeButton";
import NavigationButtonGroup from "./src/navigationButtonGroup";
import { ZoomToVisibleButton } from "./src/zoomToVisibleButton";
import FlipButton from "./src/FlipButton";
import LengthDimensionButton from "./src/lengthDimensionButton";
import HideButton from "./src/hideButton";

const ActionButtonPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();

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
    const viewer = components.get(ModelViewManager);

    if (viewer.SelectedGroup?.id === undefined) {
      const hider = components.get(OBC.Hider);
      hider.set(true);

    } else {
      viewer.isolate(viewer.SelectedGroup?.id, viewer.Tree?.id ?? "")
    }

  };

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
          {/* // backgroundColor: colors.primary[400], */}
          <ButtonGroup variant="contained" style={{ height: "40px" }}>

            <Tooltip title="Show all">
              <Button
                onSelect={() => { console.log('selected') }}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.hover,
                  },
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.main,
                  },
                  "&.Mui-doubleClicked": {
                    backgroundColor: theme.palette.primary.doubleClicked,
                  },
                  // "&:focus": {
                  //   outline: "none", // Removes the default focus ring
                  //   boxShadow: "none", // Removes the focus box-shadow if present
                  // },
                }}
                onClick={() => showAll()}
                style={{ border: "0" }}
                color="primary"
              //   variant={open ? "contained" : "outlined"}
              >
                <Icon icon="mdi:eye" />
              </Button>
            </Tooltip>
            <IsolateButton />
            <HideButton />

            {/* <GroupTypeButton /> */}
            <VisibilityModeButton />

            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
            <NavigationButtonGroup />
            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
            <ZoomToVisibleButton />


            <ShowTagsButton variant="panel" />
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

export default ActionButtonPanel;
