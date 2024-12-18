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
import ModelFlipper from "../../../bim-components/modelFlipper";
import { NotificationCenter, notificationType } from "../../../bim-components/notificationCenter";


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
  const [isVisible, setVisibility] = useState<boolean>(false);
  const [showToolTip, setShowToolTip] = useState<boolean>(false);
  const [showHVACWarning, setShowHVACWarning] = useState<boolean>(false);
  const [showFlipWarning, setShowFlipWarning] = useState<boolean>(false);
  const [showTip, setShowTip] = useState(false);
  useEffect(() => {
    if (!components) return;

    // start listening
    const viewManager = components.get(ModelViewManager);
    const hvacViewer = components.get(HVACViewer);
    const modelFlipper = components.get(ModelFlipper);
    components.get(NotificationCenter).enabled;
    hvacViewer.enabled = true;
    viewManager.onSelectedGroupChanged.add(handleSelectedGroup);
    hvacViewer.onFoundElementsChanged.add(handleHvacFound);
    modelFlipper.onModelFlipEnd.add(handleFlip)

    return () => {
      viewManager.onSelectedGroupChanged.remove(handleSelectedGroup);
      hvacViewer.onFoundElementsChanged.remove(handleHvacFound);
      modelFlipper.onModelFlipEnd.add(handleFlip)

    };
  }, [components]);

  const handleHvacFound = (data: BuildingElement[]) => {
    setShowHVACWarning(data.length > 0);
    setShowTip(data.length > 0);
  };
  const handleFlip = (data: boolean) => {
    setShowFlipWarning(data);
    console.log("model flipped", data);
  };

  const handleSelectedGroup = (data: SelectionGroup) => {
    if (!data) return;

    const infoPanelData = {
      moduleName: "",
      groupType: data.groupType,
      groupName: data.groupName,
    };
    setPanelData(infoPanelData);
    if (data.groupName) setVisibility(true);
    else setVisibility(false);

    // get that group data
  };

  let hvacIsolated = false;

  const resetFlip = () => {
    const modelFlipper = components.get(ModelFlipper);
    if (modelFlipper.xAxisIsFlipped || modelFlipper.yAxisIsFlipped) {
      modelFlipper.flip(modelFlipper.xAxisIsFlipped ? "xAxis" : 'zAxis');
    }
  }

  const selectHVAC = async () => {
    const hvacViewer = components.get(HVACViewer);
    if (hvacViewer.foundElements.length <= 0) return;
    await select(hvacViewer.foundElements, components, true);
    if (!hvacIsolated) {
      await isolate(hvacViewer.foundElements, components)

      zoomAllorSelected(components, true, true)

    } else {
      //show all
      components.get(ModelViewManager).update();
    }

    hvacIsolated = !hvacIsolated
    components.get(NotificationCenter).onNotifcationTriggered.trigger({ notification: notificationType.installations, value: hvacIsolated ? "actived" : 'deactived' })


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

  const getTipColor = (): string => {

    if (showFlipWarning) return `4px solid #ed6c02`;

    if (showHVACWarning) return `4px solid #0288d1`;

    return '';
  }

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
              border: getTipColor(),
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
              onClick={() => { selectHVAC() }}
            />
          )}
          {showFlipWarning && (
            <FloatingIconButton
              icon={<Icon icon="icon-park-outline:rotate" />}
              ariaLabel={"FlipWarningIconButton"}
              disabled={false}
              color={"warning"}
              tooltip="Model flipped: click to flip back"
              onClick={() => { resetFlip() }}
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
