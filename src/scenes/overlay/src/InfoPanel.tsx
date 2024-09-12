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
    if(data.groupName)
      setVsibility(true)
    else
      setVsibility(false)

    // get that group data
  };

  const infoBoxStyle: React.CSSProperties = {
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    flexDirection: "row",
    maxWidth: "550px",
    overflow: "hidden",
    right:'auto',
    display: "flex",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    backgroundColor: colors.grey[1000],
    color:colors.primary[200],
    padding: "10px",
    zIndex: 100,
    position: 'absolute',
    alignItems: 'left',
    width: 'auto',
    transformOrigin: "left center",
    whiteSpace: 'nowrap',
  };

  

  const subBoxStyle: React.CSSProperties = {
    // flex: 1,
    // padding: "6px",
    // textAlign: "center",
  };

  const nonSelectableTextStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none', // For Safari
    MozUserSelect: 'none', // For Firefox
    msUserSelect: 'none', // For Internet Explorer/Edge
  };
  
  return (
    <> {isVisible && 
      <Box component="div"
      style={{pointerEvents: "auto" }}
      
      sx={infoBoxStyle} 
      
      >
      {infoPanelData && (
        <>
          <Typography
            component="div"
            sx={{ ...subBoxStyle, 
              ...nonSelectableTextStyle,
              whiteSpace: 'nowrap',
              // width: '100%',
              minWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis', }}
            onClick={() => setShowToolTip(!showToolTip)}
          >
            {infoPanelData.groupType}
          </Typography>
          <Typography
            component="div"
            variant="h5"
            sx={{ ...subBoxStyle, 
              ...nonSelectableTextStyle,
              flexGrow: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis', }}
            onClick={() => setShowToolTip(!showToolTip)}
          >
            {infoPanelData.groupName}
          </Typography>
          {/* Add more items here as needed */}
        </>
      )}
      {/* {showToolTip && (
        <Box component="div"  sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}>
          <Typography>Tooltip Item 1</Typography>
          <Typography>Tooltip Item 2</Typography>
          <Typography>Tooltip Item 3</Typography>
        </Box>
      )} */}
    </Box>}</>
    
  );
};

