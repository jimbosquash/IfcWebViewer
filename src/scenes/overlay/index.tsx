import { Snackbar, Alert } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { FloatingPropertiesPanel } from "../../components/FloatingPropertiesPanel";
import { ComponentsContext } from "../../context/ComponentsContext";
import { useModelContext } from "../../context/ModelStateContext";
import { buildingElement } from "../../utilities/BuildingElementUtilities";
import Topbar from "../global/topBar";
import FloatingButtonGroup from "./floatingButtonGroup";
import * as OBC from "@thatopen/components";
// import PropertyOverViewPanel from "./src/propertyOverViewPanel";
import TaskOverViewPanel from "./src/taskOverviewPanel";

const Overlay = () => {
  const [isGroupPanelVisible, setIsGroupPanelVisible] = useState(true);
  const [isPropertyPanelVisible, setIsPropertyPanelVisible] = useState(false);
  const [selectedBuildingElements, setSelectedBuildingElements] = useState<buildingElement[]>();
  const { selectedGroup } = useModelContext();
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const components = useContext(ComponentsContext);

  useEffect(() => {
    if (!components) return;
    const fragments = components.get(OBC.FragmentsManager);
    if (!fragments) return;

    fragments.onFragmentsLoaded.add((data) => setSnackbarOpen(true));

    return () => {
      fragments.onFragmentsLoaded.remove((data) => setSnackbarOpen(true));
    };
  }, [components]);

  useEffect(() => {
    if (selectedGroup) {
      setSelectedBuildingElements(selectedGroup.elements);
    }
  }, [selectedGroup]);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        // overflow: "auto", // This allows scrolling within the Overlay if content exceeds its size
      }}
    >
      {" "}
      <div style={{ pointerEvents: "auto" }}>
        <Topbar />
      </div>
      <div style={{ pointerEvents: "auto" }}>
        <FloatingButtonGroup
          togglePropertyPanelVisibility={() => setIsPropertyPanelVisible(!isPropertyPanelVisible)}
          toggleGroupsPanelVisibility={() => setIsGroupPanelVisible(!isGroupPanelVisible)}
        />
      </div>
      {isGroupPanelVisible && (
        <div style={{ pointerEvents: "auto" }}>
          <TaskOverViewPanel />
        </div>
      )}
      {isPropertyPanelVisible && (
        // <PropertyOverViewPanel buildingElements={selectedBuildingElements} />
        <div style={{ pointerEvents: "auto" }}>
          <FloatingPropertiesPanel />
        </div>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          {fileName} loaded successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};
export default Overlay;
