import { Icon } from "@iconify/react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { FragmentsGroup } from "@thatopen/fragments";
import { useEffect, useState } from "react";
import { ModelCache } from "../../../bim-components/modelCache";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import IfcDropZone from "../../../components/ifcDropZone";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { tokens } from "../../../theme";
import { uploadFile } from "../../../utilities/IfcFileLoader";
import { knownProperties } from "../../../utilities/types";
import PublicFilesComponent from "./src/recentFilesTable";
import { uploadFragment } from "../../../utilities/supabaseUtilities";
import * as OBC from "@thatopen/components";

export const WelcomePanel = () => {
  const components = useComponentsContext();
  const theme = useTheme();
  const [loadedModel, setLoadedModel] = useState<FragmentsGroup>();
  const [enableView, setEnableView] = useState<boolean>(true);

  useEffect(() => {
    if (!components) return;

    const fragments = components.get(OBC.FragmentsManager);
    const listenForModelLoad = () => {
      console.log('loaded model')
      setEnableView(false)
    }
    fragments.onFragmentsLoaded.add(listenForModelLoad)

    return (
      fragments.onFragmentsLoaded.remove(listenForModelLoad)
    )
  }, [])



  const handleFileUpload = async (data: File) => {
    console.log("Opening Ifc file please wait.");
    const newModel = await uploadFile(data, components, false);
    if (newModel) {
      // use to give user settings preference in window (uploading configs or ignoring configs)
      // setLoadedModel(newModel);
      uploadFragment(newModel, components)
      // const modelViewManager = components.get(ModelViewManager);
      // await components.get(ModelCache).add(newModel, new Uint8Array());
      // setEnableView(false)
    }
  };

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
              maxWidth: "500px",
              width: "40%",
              maxHeight: "1000px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              position: "relative", // Needed for the close button
            }}
          >
            {/* Close Button */}
            <Box
              component="div"
              sx={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "24px",
                height: "24px",
                backgroundColor: "#f0f0f0",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.2)",
                zIndex: 10000, // Ensure it's above everything else
              }}
              onClick={() => setEnableView(false)} // Close action
            >
              <Typography
                variant="body2"
                sx={{
                  color: "gray",
                  fontWeight: "bold",
                  fontSize: "14px",
                  lineHeight: "1",
                  textAlign: "center",
                }}
              >
                X
              </Typography>
            </Box>

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
                .ifc
              </Typography>
            </Box>

            {loadedModel === undefined && (
              <Box component="div">
                <Typography variant="h6">The Smart IFC Assistant</Typography>
                <Typography variant="body2">Suitable for .ifc files structured for Sustainer data</Typography>
                <Box component="div" sx={{ alignSelf: "bottom", margin: "0px", padding: 4, height: "100%" }}>
                  <IfcDropZone onFileUpload={handleFileUpload} />
                </Box>
              </Box>
            )}
            {<PublicFilesComponent />}

            {/* User selects how to format model */}
            {/* {loadedModel !== undefined && (
              <GroupSelector loadedModel={loadedModel} setEnabled={(data) => setEnableView(data)} />
            )} */}
          </Paper>
        </Box>
      )}
    </>
  );

};

interface groupSelectorProps {
  loadedModel: FragmentsGroup;
  setEnabled: (enabled: boolean) => void;
}
const GroupSelector: React.FC<groupSelectorProps> = ({ loadedModel, setEnabled }) => {
  const components = useComponentsContext();

  const handleModelViewSet = async (data: "Assembly" | "Station") => {
    if (!loadedModel) return;
    setEnabled(false);
    const modelViewManager = components.get(ModelViewManager);
    modelViewManager.stationTreeStructure =
      data === "Assembly"
        ? [knownProperties.Assembly, knownProperties.BuildingStep]
        : [knownProperties.Station, knownProperties.BuildingStep];
    await components.get(ModelCache).add(loadedModel, new Uint8Array());
  };

  return (
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
          onClick={() => {
            setEnabled(false);
            handleModelViewSet("Station");
          }}
          sx={{
            height: "70%",
            width: "40%",
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
          <Icon icon="streamline:warehouse-1" style={{ fontSize: "52px", marginBottom: "4px" }} />
          <Typography variant="body1">View by Station</Typography>
        </Box>

        <Box
          component="div"
          onClick={() => {
            setEnabled(false);
            handleModelViewSet("Assembly");
          }}
          sx={{
            height: "70%",
            width: "40%",
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
          <Icon icon="system-uicons:boxes" style={{ fontSize: "52px", marginBottom: "4px" }} />
          <Typography variant="body1">View by Assemblies</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomePanel;

