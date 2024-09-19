import { Snackbar, Alert, Box } from "@mui/material";
import { FragmentsGroup } from "@thatopen/fragments";
import { useCallback, useState } from "react";
import LeftSidePanel from "../overlay/leftSidePanel";
import RightSidePanel, { sidebarWidth } from "../overlay/rightSidePanel";
import { Scene } from "./src/scene";

export const Viewer = () => {
  const [rightPanelWidth, setRightPanelWidth] = useState(52); // Default width
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(52); // Default width
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [hasModel, setHasModel] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleLoadedModel = (data: FragmentsGroup | null) => {
    setHasModel(true);
    console.log("overlay handel opening", hasModel);
    setSnackbarOpen(true);
  };

  const handleRightPanelWidthChange = useCallback((newWidth: number) => {
    setRightPanelWidth(newWidth);
    console.log("rightpanel size change", newWidth);
  }, []);

  const handleLeftPanelWidthChange = (newWidth: number) => {
    setLeftPanelWidth(newWidth);
  };

  return (
    <Box
      className="viewer"
      component="div"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent:'space-between',
        overflow: "hidden",
      }}
    >
      <LeftSidePanel />

      <Box component="div" sx={{ flexGrow: 1, overflow:'hidden'}}>
        <Scene />
      </Box>
      
      <RightSidePanel />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%", zIndex: "1200" }}>
          {fileName} loaded successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};
