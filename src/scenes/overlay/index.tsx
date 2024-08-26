import { Snackbar, Alert, useTheme, Box, Paper, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useComponentsContext } from "../../context/ComponentsContext";
import ActionButtonPanel from "./actionButtonPanel/actionButtonPanel";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import AssemblyBrowser from "./src/AssemblyBrowser";
import FloatingDataGrid from "./src/draggabeDataGrid";
import { ModelViewManager } from "../../bim-components/modelViewer";
import { InfoPanel } from "./src/InfoPanel";
import { useTopBarContext } from "../../context/TopBarContext";
import { TaskManager } from "../../bim-components/taskManager";
import { FragmentsGroup } from "@thatopen/fragments";
import IfcDropZone from "../../components/ifcDropZone";
import { uploadFile } from "../../utilities/IfcFileLoader";
import PropertyOverViewPanel from "./src/propertyOverViewPanel";
import SideBox from "./src/sidePanel";

const Overlay = () => {
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const components = useComponentsContext();
  const [hasModel, setHasModel] = useState<boolean>(false);
  const viewManager = useRef<ModelViewManager>();
  const theme = useTheme();
  // const { isAssemblyBrowserVisible, isPropertiesPanelVisible } = useTopBarContext();
  const [hasLoadedModel, setHasLoadedModel] = useState<boolean>(false);

  useEffect(() => {
    if (!components) return;
    const fragments = components.get(OBC.FragmentsManager);
    viewManager.current = components.get(ModelViewManager);
    if (!fragments || !viewManager.current) return;

    fragments.onFragmentsLoaded.add((data) => handleLoadedModel(data));
    viewManager.current.onSelectedGroupChanged.add((data) => handleLoadedModel(null));

    return () => {
      fragments.onFragmentsLoaded.remove((data) => handleLoadedModel(data));
    };
  }, [components]);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleLoadedModel = (data: FRAGS.FragmentsGroup | null) => {
    if (data !== null) {

      const taskManager = components?.get(TaskManager);
      if (!taskManager) return;

      // taskManager.
    }
    setHasModel(true);
    console.log("overlay handel opening", hasModel);
    setSnackbarOpen(true);
  };

  const handleFileUpload = async (data: File) => {
    console.log("OPENING FILE PLEASE WAIT.");
    await uploadFile(data,components)
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
      
      {!hasModel && (
        <Box
          component="div"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent grey
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999, // ensure it's on top of everything
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              maxWidth: "90%",
              width: 400,
              textAlign: "center",
            }}
          >
            <Typography variant="h5" gutterBottom>
              IFC File Uploader
            </Typography>
            <IfcDropZone onFileUpload={handleFileUpload} />
          </Paper>
        </Box>
      )}

      <div style={{ pointerEvents: "auto" }}>
        <InfoPanel />
      </div>

      <div style={{ pointerEvents: "auto" }}>
        <ActionButtonPanel />
      </div>

      <SideBox/>

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



// {isPropertiesPanelVisible && (
//   <div style={{ pointerEvents: "auto" }}>
//     <PropertyOverViewPanel />
//     {/* <FloatingDataGrid /> */}
//   </div>
// )}
