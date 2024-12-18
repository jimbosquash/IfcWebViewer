import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Icon } from "@iconify/react";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { ModelCache } from "../../../../bim-components/modelCache";
import { isolate } from "../../../../utilities/BuildingElementUtilities";
import { ToolBarButton } from "./toolbarButton";

export const IsolateButton = () => {
  const components = useComponentsContext();

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
        components.get(ModelViewManager).onVisibilityUpdated.trigger({ elements: [...elements], treeID: '' });
      }
    }
  }

  return (
    <ToolBarButton
      toolTip="Isolate Selected"
      onClick={IsolateSelected}
      content={<Icon icon="mdi:eye-outline" />}
    />
  );
};
