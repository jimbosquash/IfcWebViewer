import { Box, Typography, IconButton,useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import { buildingElement,groupElements } from "../../utilities/BuildingElementUtilities";
import TocIcon from "@mui/icons-material/Toc";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import BuildingStepBox from "./BuildingStepBox";

interface StationBoxProps{
    stationName: string;
    elements : buildingElement[];
    setSelectedElements: (elements: buildingElement[]) => void;
    toggleElementVisibility: (groupType: string, buildingStep: string) => void;
    getVisibility: (groupName: string) => boolean;
  }

  // todo could move state of step visibility to here
  const StationBox = (props : StationBoxProps) => {
    const {stationName,elements, setSelectedElements, toggleElementVisibility, getVisibility} = props;
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [nestedListVisible, setNestedListVisible] = useState<{ [key: string]: boolean }>({});

  
    const toggleNestedListVisibility = (stationName: string) => {
      setNestedListVisible(prev => ({
        ...prev,
        [stationName]: !prev[stationName],
      }));
    };
  
    return (<>
      <Box component="div">
        <Box component="div" 
              onClick={() => { 
                console.log('clicked station',stationName)
                setSelectedElements(elements)}}
                width='100%' 
                style={{
                  // border: '1px solid #ccc',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                  padding: '10px',
                  width: "250px",
                  height:"35px",
                  margin: '10px 0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }} 
                display="flex" 
                alignItems="center"
                justifyContent='space-between'>
                <Typography noWrap
                maxWidth={'105px'}
                  variant="h6" 
                  sx={{ flexGrow: 1 }} 
                >{ stationName.startsWith("Prefab -") ? stationName.slice("Prefab -".length) : stationName}
                </Typography>
  
                <Typography 
                color={colors.primary[300]}
                   noWrap
                  variant="body2" 
                  sx={{ marginLeft: '10px' }}
                  >el : {elements.length}
                </Typography>
  
                <IconButton size="small" sx={{ marginLeft: '8px', color: colors.grey[500] }} 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleElementVisibility('Station',stationName);
                }}>
                  {getVisibility(stationName) ? <VisibilityOffOutlinedIcon/> : <VisibilityOutlinedIcon/>} 
                </IconButton>
  
                <IconButton size="small" sx={{ marginLeft: '4px', color: colors.grey[500] }} onClick={(e) => {
                  e.stopPropagation();
                  toggleNestedListVisibility(stationName)
                  }}>
                  {getVisibility(stationName) ? <TocIcon/> : <TocIcon/>} 
                </IconButton>
              </Box>
  
              {/* // here add fold down to */}
              {nestedListVisible[stationName] && (
              <Box component="div" style={{ marginLeft: '5px', marginTop: '10px' }}>
              {Object.entries(groupElements(elements, 'BuildingStep')).map(([buildingStep, elements]) => (
                <BuildingStepBox 
                buildingStep={buildingStep} 
                elements={elements} 
                getVisibility={getVisibility} 
                setSelectedElements={setSelectedElements} 
                toggleElementVisibility={toggleElementVisibility}/> 
              ))}
              </Box>
            )}
            </Box>
    </>)
  }

  export default StationBox;
  