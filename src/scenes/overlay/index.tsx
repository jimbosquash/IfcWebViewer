import { Snackbar, Alert, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useComponentsContext } from "../../context/ComponentsContext";
import FloatingButtonGroup from "./floatingButtonGroup";
import * as OBC from "@thatopen/components";
import AssemblyBrowser from "./src/AssemblyBrowser";
import FloatingDataGrid from "./src/draggabeDataGrid";
import { ModelViewManager } from "../../bim-components/modelViewer";
import { InfoPanel } from "./src/InfoPanel";
import { useTopBarContext } from "../../context/TopBarContext";

const Overlay = () => {
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const components = useComponentsContext();
  const [hasModel, setHasModel] = useState<boolean>(false);
  const viewManager = useRef<ModelViewManager>();
  const theme = useTheme();
  const { isAssemblyBrowserVisible, isPropertiesPanelVisible } = useTopBarContext();

  useEffect(() => {
    if (!components) return;
    const fragments = components.get(OBC.FragmentsManager);
    viewManager.current = components.get(ModelViewManager);
    if (!fragments || !viewManager.current) return;

    fragments.onFragmentsLoaded.add((data) => handleLoadedModel());
    viewManager.current.onSelectedGroupChanged.add((data) => handleLoadedModel());

    return () => {
      fragments.onFragmentsLoaded.remove((data) => handleLoadedModel());
    };
  }, [components]);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleLoadedModel = () => {
    setHasModel(true);
    console.log("overlay handel opening", hasModel);
    setSnackbarOpen(true);
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
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <InfoPanel />
      </div>

      <div style={{ pointerEvents: "auto" }}>
        <FloatingButtonGroup/>
      </div>

      {isAssemblyBrowserVisible && (
        <div style={{ pointerEvents: "auto" }}>
          <AssemblyBrowser />
        </div>
      )}

      {isPropertiesPanelVisible && (
        <div style={{ pointerEvents: "auto" }}>
          {/* <FloatingPropertiesPanel /> */}
          <FloatingDataGrid />
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
