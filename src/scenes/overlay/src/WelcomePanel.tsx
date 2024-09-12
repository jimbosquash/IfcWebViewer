import { Icon } from "@iconify/react";
import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import { FragmentsGroup } from "@thatopen/fragments";
import { useState } from "react";
import { ModelCache } from "../../../bim-components/modelCache";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import IfcDropZone from "../../../components/ifcDropZone";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { tokens } from "../../../theme";
import { uploadFile } from "../../../utilities/IfcFileLoader";
import { knownProperties } from "../../../utilities/types";

export const WelcomePanel = () => {
  const components = useComponentsContext();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loadedModel, setLoadedModel] = useState<FragmentsGroup>();
  const [enableView, setEnableView] = useState<boolean>(true);

  const handleFileUpload = async (data: File) => {
    console.log("Opening Ifc file please wait.");
    const newModel = await uploadFile(data, components, false);
    if (newModel) {
      setLoadedModel(newModel);
    }
  };

  const handleModelViewSet = (data: 'Assembly' | "Station") => {
    if(!loadedModel) return;
    const modelViewManager = components.get(ModelViewManager)
    modelViewManager.defaultTreeStructure = data === "Assembly" ? [knownProperties.Assembly,knownProperties.BuildingStep] : [knownProperties.Station,knownProperties.Assembly];
    components.get(ModelCache).add(loadedModel, new Uint8Array())
    setEnableView(false)
  }
  return (
    <>
      {enableView && (
        <Box
          component="div"
          sx={{
            pointerEvents: "auto",
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
              // padding: 4,
              maxWidth: "500px",
              width: "40%",

              height: "20%",
              maxHeight: "800px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              component="div"
              sx={{
                margin: "0px",
                width: "100%",
                height: "100px",
                justifyContent: "center",
                flexDirection: "row",
                alignContent: "center",
                display: "flex",
              }}
            >
              <Box
                component="img"
                src="/images/Sustainer-Logo-Beeldscherm-RGB-Kleur-Klein.png"
                alt="Logo"
                sx={{
                  height: "100%",
                  objectFit: "contain",
                  marginTop: "4px", // Added some spacing between logo and text
                }}
              />
              <Typography
                variant="h1"
                style={{
                  color: theme.palette.mode !== "dark" ? tokens("light").grey[800] : tokens("dark").grey[700],
                  alignSelf: "end", // This aligns the typography to the bottom
                  marginLeft: "-20px",
                  marginBottom: "18px",
                }}
              >
                .iva
              </Typography>
            </Box>

            {loadedModel === undefined && (
              <Box component="div">
                <Typography variant="h6">The Smart IFC Viewing Assistant</Typography>
                <Box component="div" sx={{ alignSelf: "bottom", margin: "0px", padding: 4, height: "100%" }}>
                  <IfcDropZone onFileUpload={handleFileUpload} />
                </Box>
              </Box>
            )}

            {loadedModel !== undefined && (
              <Box component="div">
                <Typography variant="h6">{loadedModel.name} : Successfully loaded</Typography>
                <Box
                  component="div"
                  sx={{
                    margin: "0px",
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    flexDirection: "row",
                    alignContent: "center",
                    display: "flex",
                  }}
                >
                  <Box
                    component="div"
                    onClick={() => handleModelViewSet("Station")}
                    sx={{
                      height: "70%",
                      width:"40%",
                      margin: "12px",
                      pointerEvents: "auto",
                      border: `2px dashed gray`,
                      borderRadius: "4px",
                      padding: "20px",
                      cursor: "pointer",
                      position: "relative",
                      zIndex: 1000,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Icon  icon="streamline:warehouse-1" style={{ fontSize: "52px", marginBottom: "4px" }} />
                    <Typography variant="body1">View by Station</Typography>
                  </Box>


                  <Box
                    component="div"
                    onClick={() => handleModelViewSet("Assembly")}
                    sx={{
                      height: "70%",
                      width:"40%",
                      margin: "12px",
                      pointerEvents: "auto",
                      border: `2px dashed gray`,
                      borderRadius: "4px",
                      padding: "20px",
                      cursor: "pointer",
                      position: "relative",
                      zIndex: 1000,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Icon  icon="system-uicons:boxes" style={{ fontSize: "52px", marginBottom: "4px" }} />
                    <Typography variant="body1">View by Assemblies</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </>
  );
};

export default WelcomePanel;
