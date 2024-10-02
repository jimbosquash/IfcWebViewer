import { Icon } from "@iconify/react";
import { Box, SpeedDial, SpeedDialAction, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { HVACViewer } from "../../../bim-components/hvacViewer";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import FloatingIconButton from "../../../components/floatingIconButton";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { tokens } from "../../../theme";
import { BuildingElement, GroupingType, SelectionGroup } from "../../../utilities/types";
import { isolate, select } from "../../../utilities/BuildingElementUtilities";
import { zoom, zoomAllorSelected } from "../../../utilities/CameraUtilities";


interface InfoPanelProps {
  moduleName: string;
  groupType: GroupingType;
  groupName: string;
}

export const InfoPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [infoPanelData, setPanelData] = useState<InfoPanelProps>();
  const [isVisible, setVsibility] = useState<boolean>(false);
  const [showToolTip, setShowToolTip] = useState<boolean>(false);
  const [showHVACWarning, setShowHVACWarning] = useState<boolean>(false);
  const [showTip, setShowTip] = useState(false);
  useEffect(() => {
    if (!components) return;

    // start listening
    const viewManager = components.get(ModelViewManager);
    const hvacViewer = components.get(HVACViewer);
    hvacViewer.enabled = true;
    viewManager.onSelectedGroupChanged.add(handleSelectedGroup);
    hvacViewer.onFoundElementsChanged.add(handleHvacFound);

    return () => {
      viewManager.onSelectedGroupChanged.remove(handleSelectedGroup);
      hvacViewer.onFoundElementsChanged.remove(handleHvacFound);
    };
  }, [components]);

  const handleHvacFound = (data: BuildingElement[]) => {
    setShowHVACWarning(data.length > 0);
    setShowTip(data.length > 0);
    console.log("havac found", data.length);
  };

  const handleSelectedGroup = (data: SelectionGroup) => {
    if (!data) return;

    const infoPanelData = {
      moduleName: "",
      groupType: data.groupType,
      groupName: data.groupName,
    };
    setPanelData(infoPanelData);
    if (data.groupName) setVsibility(true);
    else setVsibility(false);

    // get that group data
  };

  let hvacIsolated = false;

  const selectHVAC = async () => {
    const hvacViewer = components.get(HVACViewer);
    if(hvacViewer.foundElements.length <= 0) return;
    await select(hvacViewer.foundElements,components,true);
    if(!hvacIsolated){
      await isolate(hvacViewer.foundElements,components)

      zoomAllorSelected(components,true,true)

    } else {
      //show all
      components.get(ModelViewManager).update();
    }
    hvacIsolated = !hvacIsolated

  }

  const infoZoneStyle: React.CSSProperties = {
    top: 10,
    left: "50%",
    transform: "translateX(-50%)",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "flex-end",
    display: "flex",
    transformOrigin: "left center",
    // flexGrow: 1,
    height: "100px",
    overflow: "hidden",
    padding: "10px",
    position: "absolute",
    zIndex: 100,
    pointerEvents: "auto",
  };

  const nonSelectableTextStyle = {
    userSelect: "none",
    WebkitUserSelect: "none", // For Safari
    MozUserSelect: "none", // For Firefox
    msUserSelect: "none", // For Internet Explorer/Edge
  };

  return (
    <>
      {" "}
      {isVisible && (
        <Box
          sx={{
            top: 15,
            // left: "25%",
            width: "50%",
            transform: "translateX(75%)",
            flexDirection: "row",
            flexWrap: "nowrap",
            justifyContent: "flex-start",
            display: "flex",
            transformOrigin: "left center",
            // flexGrow: 1,
            height: "100px",
            overflow: "hidden",
            padding: "10px",
            position: "absolute",
            zIndex: 100,
            gap: 2,
            pointerEvents: "auto",
          }}
          component="div"
          className="floatingTopInfoZone"
        >
          <Box
            component="div"
            className="InfoPanel"
            sx={{
              flexDirection: "row",
              maxWidth: "550px",
              height: "60%",
              overflow: "hidden",
              display: "flex",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "20px",
              backgroundColor: colors.grey[1000],
              color: colors.primary[200],
              padding: "15px",
              zIndex: 100,
              alignItems: "center",
              minWidth: "300px",
              whiteSpace: "nowrap",
              pointerEvents: "auto",
              border: showTip ? `4px solid #0288d1`: "",
            }}
          >
            <Typography
              component="div"
              variant="h5"
              sx={{
                ...nonSelectableTextStyle,
                whiteSpace: "nowrap",
                minWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => setShowToolTip(!showToolTip)}
            >
              {infoPanelData?.groupType}
            </Typography>
            <Typography
              component="div"
              variant="h5"
              sx={{
                ...nonSelectableTextStyle,
                flexGrow: 1,
                minWidth: "100px",
                maxWidth: "300px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => setShowToolTip(!showToolTip)}
            >
              {infoPanelData?.groupName}
            </Typography>
          </Box>

          {showHVACWarning && (
            <FloatingIconButton
              icon={<Icon icon="mdi:pipe-disconnected" />}
              ariaLabel={"HvacWarningIconButton"}
              disabled={false}
              color={"info"}
              tooltip="TIP: HVAC elements found in this group!"
              onClick={() => {selectHVAC()}}
            />
          )}


        </Box>
      )}
    </>
  );
};


// {showHVACWarning && (
//   <SpeedDial
//   direction={'down'}
// ariaLabel="SpeedDial basic example"
// // sx={{ position: 'absolute', bottom: 16, right: 16 }}
// icon={<Icon icon="mdi:pipe-disconnected" />}
// >
// {/* {actions.map((action) => ( */}
// <SpeedDialAction
// key={'select'}
// icon={<Icon icon="mdi:pipe-disconnected" />}
// tooltipTitle={"Select All HVAC"}
// />
// {/* ))} */}
// </SpeedDial>

// )}
