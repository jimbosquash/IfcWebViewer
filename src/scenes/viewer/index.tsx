import { Snackbar, Alert, Box } from "@mui/material";
import { FragmentsGroup } from "@thatopen/fragments";
import { useEffect, useState } from "react";
import { ModelCache } from "../../bim-components/modelCache";
import { useComponentsContext } from "../../context/ComponentsContext";
import LeftSidePanel from "../overlay/leftSidePanel";
import RightSidePanel from "../overlay/rightSidePanel";
import WelcomePanel from "../overlay/src/WelcomePanel";
import { Scene } from "./src/scene";

export const Viewer = () => {
  const components = useComponentsContext();
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (!components) return;
    const cache = components.get(ModelCache);
    cache.onModelAdded.add((data) => handleLoadedModel(data));

    return () => {
      cache.onModelAdded.remove((data) => handleLoadedModel(data));
    };
  }, [components]);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleLoadedModel = (data: FragmentsGroup) => {
    console.log("viewer handel opening", data);
    setFileName(data?.name);
    setSnackbarOpen(true);
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
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <WelcomePanel />

      <LeftSidePanel />

      <Box component="div" sx={{ flexGrow: 1, overflow: "hidden" }}>
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
