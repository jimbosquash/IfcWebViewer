import { useEffect, useState } from "react";
import { useModelContext } from "../../context/ModelStateContext";
import { buildingElement } from "../../utilities/BuildingElementUtilities";
import FloatingButtonGroup from "./floatingButtonGroup";
import PropertyOverViewPanel from "./src/propertyOverViewPanel";
import TaskOverViewPanel from "./src/taskOverviewPanel";

const Overlay = () => {
  // here we take in the frag mesh and display relevant over all data aswell as state of whats visiable/ active/ so on
  const [isGroupPanelVisible, setIsGroupPanelVisible] = useState(false);
  const [isPropertyPanelVisible, setIsPropertyPanelVisible] = useState(false);
  const [selectedBuildingElements, setSelectedBuildingElements] = useState<buildingElement[]>();
  const {selectedGroup} = useModelContext();

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
      {isPropertyPanelVisible && <PropertyOverViewPanel buildingElements={selectedBuildingElements} />
      }
    </div>
  );
};
export default Overlay;
