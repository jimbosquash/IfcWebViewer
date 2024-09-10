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
    const hider = components.get(OBC.Hider);

    hider.set(true);
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
          <ButtonGroup variant="contained" style={{ backgroundColor: colors.primary[400], height: "40px" }}>
            <GroupTypeButton />
            <VisibilityModeButton />

            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
            <NavigationButtonGroup />
            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

            <ShowTagsButton variant="panel" />
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
