import { Button, Tooltip, useTheme } from "@mui/material";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Icon } from "@iconify/react";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { ModelCache } from "../../../../bim-components/modelCache";
import { isolate, select } from "../../../../utilities/BuildingElementUtilities";
import { ToolBarButton } from "./toolbarButton";

export const HideButton = () => {
  const components = useComponentsContext();

  async function hideSelected(): Promise<void> {
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

  return (
    <ToolBarButton
      toolTip="Hide Selected"
      onClick={hideSelected}
      content={<Icon icon="mdi:eye-off-outline" />}
    />
  );
};

export default HideButton;