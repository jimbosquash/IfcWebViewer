import { Box, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { tokens } from "../../../theme";
import { GroupingType, SelectionGroup } from "../../../utilities/types";

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

  useEffect(() => {
    if (!components) return;

    // start listening
    const viewManager = components.get(ModelViewManager);
    viewManager.onSelectedGroupChanged.add((data) => handleSelectedGroup(data));
  }, [components]);

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

  const infoBoxStyle: React.CSSProperties = {
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    flexDirection: "row",
    maxWidth: "550px",
    overflow: "hidden",
    right: "auto",
    display: "flex",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    backgroundColor: colors.grey[1000],
    color: colors.primary[200],
    padding: "10px",
    zIndex: 100,
    position: "absolute", // change to relative when ready
    alignItems: "left",
    width: "auto",
    transformOrigin: "left center",
    whiteSpace: "nowrap",
  };

  const infoZoneStyle: React.CSSProperties = {
    top: "20px",
    flexDirection: "row",
    width: "80%",
    height: "100%",
    overflow: "hidden",
    display: "flex",
    padding: "10px",
    position:'relative',
    zIndex: 100,
    alignItems: "Center",
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
        sx={{infoZoneStyle}}
        component="div"
        className="floatingTopInfoZone" 
        >
        <Box component="div" 
        className="InfoPanel" 
        style={{ pointerEvents: "auto" }} 
        sx={infoBoxStyle}>
          {infoPanelData && (
            <>
              <Typography
                component="div"
                sx={{
                  ...nonSelectableTextStyle,
                  whiteSpace: "nowrap",
                  // width: '100%',
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
        {/* <Box component='div' 
        style={{backgroundColor:"blue", height:"40px", width:"40px", position:'relative'}}>

        </Box> */}
        </Box>
      )}
    </>
  );
};
