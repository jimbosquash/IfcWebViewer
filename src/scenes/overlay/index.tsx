import { Snackbar, Alert, useTheme, Button } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { FloatingPropertiesPanel } from "../../components/FloatingPropertiesPanel";
import { ComponentsContext } from "../../context/ComponentsContext";
import Topbar from "../global/topBar";
import FloatingButtonGroup from "./floatingButtonGroup";
import * as OBC from "@thatopen/components";
import TaskOverViewPanel from "./src/taskOverviewPanel";
import { FloatingUploadIfcButton } from "../../components/uploadButton";
import { tokens } from "../../theme";
import FloatingDataGrid from "./src/draggabeDataGrid";
import { ModelViewManager } from "../../bim-components/modelViewer";

const Overlay = () => {
  const [isGroupPanelVisible, setIsGroupPanelVisible] = useState(true);
  const [isPropertyPanelVisible, setIsPropertyPanelVisible] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const components = useContext(ComponentsContext);
  const [hasModel, setHasModel] = useState<boolean>(false);
  const viewManager = useRef<ModelViewManager>();
  const theme = useTheme();
    const colors = tokens(theme.palette.mode);


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
    setHasModel(true)
    console.log('overlay handel opening',hasModel)
    setSnackbarOpen(true)
  }

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


// {!hasModel && <div 
//   // style={{
//   //   position: "fixed",
//   //   bottom: "50%",
//   //   left: "50%",
//   //   zIndex: 1000,
//   //   width: 450,
//   //   height: 35,
//   //   cursor: "grab",
//   //   display: "inline-block",
//   // }}
//   ><Button
//   onClick={() => {console.log("btn click")}}
//   sx={{
//       backgroundColor: colors.blueAccent[700],
//       color: colors.grey[100],
//       zIndex: 1000,
//       fontSize: "14px",
//       fontWeight: "bold",
//       cursor: "grab",
//       padding: "10px 20px",
//   }}>
//   {/* <UploadOutlinedIcon sx={{ mr: "10px" }} /> */}
//   Upload .IFC
// </Button>
//   </div>}