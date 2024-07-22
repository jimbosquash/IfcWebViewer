import { Box, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { ComponentsContext } from "../../../context/ComponentsContext";
import { tokens } from "../../../theme";
import { GroupingType, SelectionGroup } from "../../../utilities/BuildingElementUtilities";

interface InfoPanelProps {
  moduleName: string;
  groupType: GroupingType;
  groupName: string;
}

export const InfoPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useContext(ComponentsContext);
  const [infoPanelData, setPanelData] = useState<InfoPanelProps>();
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
      moduleName: "demo",
      groupType: data.groupType,
      groupName: data.groupName,
    };
    setPanelData(infoPanelData);

    // get that group data
  };

  const infoBoxStyle: React.CSSProperties = {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    backgroundColor: "{colors.grey[200]}",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    padding: "10px",
    zIndex: 1000,
  };

  const subBoxStyle: React.CSSProperties = {
    flex: 1,
    padding: "6px",
    textAlign: "center",
  };

  const nonSelectableTextStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none', // For Safari
    MozUserSelect: 'none', // For Firefox
    msUserSelect: 'none', // For Internet Explorer/Edge
  };
  
  return (
    <Box component="div" sx={infoBoxStyle} width="200px">
      {infoPanelData && (
        <>
          <Typography
            component="div"
            sx={{ ...subBoxStyle, ...nonSelectableTextStyle }}
            onClick={() => setShowToolTip(!showToolTip)}
          >
            {infoPanelData.groupType}
          </Typography>
          <Typography
            component="div"
            sx={{ ...subBoxStyle, ...nonSelectableTextStyle }}
            onClick={() => setShowToolTip(!showToolTip)}
          >
            {infoPanelData.groupName}
          </Typography>
          {/* Add more items here as needed */}
        </>
      )}
      {showToolTip && (
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
      )}
    </Box>
  );
};

