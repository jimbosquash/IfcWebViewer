import { Icon } from "@iconify/react";
import { Box, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { HVACViewer } from "../../../bim-components/hvacViewer";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import FloatingIconButton from "../../../components/floatingIconButton";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { tokens } from "../../../theme";
import { BuildingElement, GroupingType, SelectionGroup } from "../../../utilities/types";

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
  const [showTip, setShowTip] = useState(false)
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
    setShowTip(data.length > 0)
    console.log("havac found",data.length)
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
            border={'thick'}
            borderColor={"blue"}
            sx={{
              flexDirection: "row",
              maxWidth: "550px",
              height: "60%",
              overflow: "hidden",
              display: "flex",
              justifyItems: "center",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "20px",
              backgroundColor: showTip ? colors.blueAccent[500] : colors.grey[1000],
              color:  showTip ? colors.grey[1000] : colors.primary[200],
              padding: "10px",
              zIndex: 100,
              alignItems: "left",
              minWidth: "300px",
              width: "auto",
              whiteSpace: "nowrap",
              pointerEvents: "auto",
            }}
          >
            {infoPanelData && (
              <>
                <Typography
                  component="div"
                  sx={{
                    ...nonSelectableTextStyle,
                    whiteSpace: "nowrap",
                    minWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  onClick={() => setShowToolTip(!showToolTip)}
                >
                  {infoPanelData.groupType}
                </Typography>
                <Typography
                  component="div"
                  variant="h5"
                  sx={{
                    ...nonSelectableTextStyle,
                    flexGrow: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  onClick={() => setShowToolTip(!showToolTip)}
                >
                  {infoPanelData.groupName}
                </Typography>
                {/* Add more items here as needed */}
              </>
            )}
          </Box>
          {
            showHVACWarning && (
              <FloatingIconButton
                icon={<Icon icon="mdi:pipe-disconnected" />}
                ariaLabel={"HvacWarningIconButton"}
                disabled={false}
                color={"info"}

                tooltip="TIP: HVAC elements found in this group!"
                onClick={function (): void {
                  console.log("Hvac details");
                }}
              />
            )
          }


          {/* <Box component='div' 
        style={{backgroundColor:"green", flexShrink:'1', height:"40px", width:"40px", position:'relative'}}>
        </Box> */}
        </Box>
      )}
    </>
  );
};
