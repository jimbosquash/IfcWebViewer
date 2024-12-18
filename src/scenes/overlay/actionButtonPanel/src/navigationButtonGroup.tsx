import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { GetAdjacentGroup } from "../../../../utilities/BuildingElementUtilities";
import { ToolBarButton } from "./toolbarButton";
import { Icon } from "@iconify/react";

export const NavigationButtonGroup = () => {
  const components = useComponentsContext();


  const setAdjacentGroup = async (adjacency: "previous" | "next") => {
    console.log();

    const viewManager = components.get(ModelViewManager);

    const current = viewManager.SelectedGroup;

    if (!current) {
      console.log("No group selected, default will be used");
    }
    // console.log("Setting adjacent",current);
    console.log("GetAdjacentGroup to", current?.id, viewManager.Tree);
    const config = viewManager.configuration.get("treeNavigation")
    const newGroup = GetAdjacentGroup(current, viewManager.Tree, adjacency, config);
    console.log("next group", newGroup?.id);

    if (newGroup) {
      try {
        if (!viewManager.Tree) return;
        viewManager.setSelectionGroup(newGroup, true, viewManager.Tree.id, false);
        //zoomToSelected(viewManager.getBuildingElements(newGroup.id),components);
      } catch (error) {
        console.error("Error updating visibility:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    }
  };
  return (
    <>
      <ToolBarButton
        toolTip="Previous group"
        onClick={() => setAdjacentGroup("previous")}
        content={<Icon icon="mdi:navigate-before" width="24" height="24" />}
      />
      <ToolBarButton
        toolTip="Next group"
        onClick={() => setAdjacentGroup("next")}
        content={<Icon icon="mdi:navigate-next" width="24" height="24" />}
      />
    </>
  );
};

export default NavigationButtonGroup;
