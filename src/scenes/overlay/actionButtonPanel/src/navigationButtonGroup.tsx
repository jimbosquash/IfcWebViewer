import { Button, ButtonGroup, ToggleButtonGroup, Tooltip, useTheme } from "@mui/material";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { GetAdjacentGroup } from "../../../../utilities/BuildingElementUtilities";

export const NavigationButtonGroup = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();

  const setAdjacentGroup = async (adjacency: "previous" | "next") => {
    console.log();

    const viewManager = components.get(ModelViewManager);

    const current = viewManager.SelectedGroup;

    if (!current) {
      console.log("No group selected, default will be used");
    }
    // console.log("Setting adjacent",current);
    console.log("GetAdjacentGroup to", current?.id);
    const newGroup = GetAdjacentGroup(current, viewManager.Tree, adjacency);
    console.log("next group", newGroup?.id);

    if (newGroup) {
      try {
        if (!viewManager.Tree) return;
        viewManager.setSelectionGroup(newGroup, true);
        //zoomToSelected(viewManager.getBuildingElements(newGroup.id),components);
      } catch (error) {
        console.error("Error updating visibility:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    }
  };
  return (
    <>
      <ButtonGroup>
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
      </ButtonGroup>
    </>
  );
};

export default NavigationButtonGroup;
