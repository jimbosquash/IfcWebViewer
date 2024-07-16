import { useEffect, useState } from "react";
import { FloatingPropertiesPanel } from "../../components/FloatingPropertiesPanel";
import { useModelContext } from "../../context/ModelStateContext";
import { buildingElement } from "../../utilities/BuildingElementUtilities";
import FloatingButtonGroup from "./floatingButtonGroup";
// import PropertyOverViewPanel from "./src/propertyOverViewPanel";
import TaskOverViewPanel from "./src/taskOverviewPanel";

const Overlay = () => {
  const [isGroupPanelVisible, setIsGroupPanelVisible] = useState(true);
  const [isPropertyPanelVisible, setIsPropertyPanelVisible] = useState(false);
  const [selectedBuildingElements, setSelectedBuildingElements] =
    useState<buildingElement[]>();
  const { selectedGroup } = useModelContext();

  const toggleGroupsPanelVisibility = () =>
    setIsGroupPanelVisible(!isGroupPanelVisible);
  const togglePropertyPanelVisibility = () =>
    setIsPropertyPanelVisible(!isPropertyPanelVisible);

  useEffect(() => {
    if (selectedGroup) {
      setSelectedBuildingElements(selectedGroup.elements);
    }
  }, [selectedGroup]);

  return (
    <div style={{ position: "relative" }}>
      <FloatingButtonGroup
        togglePropertyPanelVisibility={togglePropertyPanelVisibility}
        toggleGroupsPanelVisibility={toggleGroupsPanelVisibility}
      />
      {isGroupPanelVisible && <TaskOverViewPanel />}
      {isPropertyPanelVisible && (
        // <PropertyOverViewPanel buildingElements={selectedBuildingElements} />
        <FloatingPropertiesPanel />
      )}
    </div>
  );
};
export default Overlay;
