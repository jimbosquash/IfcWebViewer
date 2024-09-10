import { Button, Tooltip, useTheme } from "@mui/material";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";
import { Icon } from "@iconify/react";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { ModelCache } from "../../../../bim-components/modelCache";
import { isolate, select } from "../../../../utilities/BuildingElementUtilities";

export const IsolateButton = () => {
  const components = useComponentsContext();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  async function IsolateSelected(): Promise<void> {
    const highlighter = components.get(OBF.Highlighter);
    const hider = components.get(OBC.Hider);
    const selected = highlighter.selection;
    if (!selected) return;

    // if items selected then isolate those, otherwise isolate selected group
    for (const selectionID of Object.keys(selected)) {
      if (selectionID !== "select") continue;
      let fragmentIdMap = selected[selectionID];
      console.log(`Selection ID: ${selectionID}, FragmentIdMap:`, fragmentIdMap, Object.values(fragmentIdMap).length);

      if (Object.values(fragmentIdMap).length === 0) {
        const modelViewManager = components.get(ModelViewManager);
        if (modelViewManager.SelectedGroup !== undefined) {
          await isolate(modelViewManager.SelectedGroup.elements, components);
        }
        return;
      }

      await hider.isolate(fragmentIdMap);
      const elements = components.get(ModelCache).getElementByFragmentIdMap(fragmentIdMap);
      if (elements) {
        components.get(ModelViewManager).onVisibilityUpdated.trigger([...elements]);
      }
    }
  }

  return (
    <>
      <Tooltip title="Isolate Selected">
        <Button
          sx={{ backgroundColor: "transparent" }}
          onClick={() => IsolateSelected()}
          style={{ color: colors.grey[400], border: "0" }}
        >
          <Icon icon="mdi:eye-off-outline" />{" "}
        </Button>
      </Tooltip>
    </>
  );
};
