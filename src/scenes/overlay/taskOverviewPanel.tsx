import { Box, useTheme,styled, Typography, Button, IconButton } from "@mui/material";
// import { styled } from "@mui/system";
import Draggable from "react-draggable";
import { tokens } from "../../theme";
import { buildingElement, GetFragmentsFromExpressIds } from "../../utilities/IfcUtilities";
import TaskBox from "./taskBox";
import TocIcon from "@mui/icons-material/Toc";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useContext, useEffect, useState } from "react";
import * as FRAGS from '@thatopen/fragments';
import * as OBC from "@thatopen/components";
import { BuildingElementsContext } from "../../context/BuildingElementsContext";
import { ComponentsContext } from "../../context/ComponentsContext";

interface taskOverviewProps {
    ifcModel : FRAGS.FragmentsGroup | undefined;
    onSelectedElementsChange : (buildingElements : buildingElement[]) => void;
}



const TaskOverViewPanel = ({ifcModel, onSelectedElementsChange} : taskOverviewProps) => {
    const theme = useTheme();
    const buildingElements = useContext(BuildingElementsContext);
    const components = useContext(ComponentsContext);
    const colors = tokens(theme.palette.mode);
    const [taskGroups, setTaskGroups] = useState<{[key: string]: buildingElement[]}>({});
    const [stationGroup, setStationGroup] = useState<{[key: string]: buildingElement[]}>({});
    const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
    const [nestedListVisible, setNestedListVisible] = useState<{ [key: string]: boolean }>({});
    const [selectedBuildingElements, setSelectedBuildingElements] = useState<buildingElement[]>([]);

    const [stationsVisible, setStationsVisible] = useState<boolean>(true);

    useEffect(() => {
      if(selectedBuildingElements)
      {
        console.log('new ELmeents selected')
        onSelectedElementsChange(selectedBuildingElements);
      }
    },[selectedBuildingElements])


    const hideAll = async () => {
      const fragments = components?.get(OBC.FragmentsManager);
      const exporessIds = Object.values(taskGroups).flat().map((e) => {return e.expressID})
      //const taskFragments = GetFragmentsFromExpressIds(exporessIds,fragments,ifcModel);
      for(const group of Object.keys(visibility))
      {
        console.log("here",group)

        //setVisibility(() => ({[group]: true}));        

        if(visibility[group])
        {
          console.log("here")

          //visibility[group] = false;

        }
      }
      console.log("visibility", visibility)

    }

    const toggleVisibility = async (groupType: string ,groupName: string) => {
      
      setVisibility((prevVisibility) => ({
        ...prevVisibility,
        [groupName]: !prevVisibility[groupName],
      }));
      
      if(components)
      {
        const fragments = components.get(OBC.FragmentsManager);
        const groupToSearch = groupType === "Station" ? stationGroup : taskGroups;
        const expressIds = groupToSearch[groupName].map((e) => {return e.expressID})
        const taskFragments = GetFragmentsFromExpressIds(expressIds,fragments,ifcModel);

        for(const fragmentType of taskFragments)
        {
          fragmentType[0].setVisibility(visibility[groupName],fragmentType[1])
        }
      }
    };

    const toggleNestedListVisibility = (stationName: string) => {
      setNestedListVisible(prev => ({
        ...prev,
        [stationName]: !prev[stationName],
      }));
    };
    const groupElements = (buildingElements: buildingElement[],groupType: "BuildingStep" | "Station") => {
      if(buildingElements)
      {
        return buildingElements.reduce((acc, element) => {
          const buildingStep = element.properties.find(prop => prop.name === groupType)?.value || 'Unknown'; 
          if(buildingStep === 'Unknown')
            return acc;
          if (!acc[buildingStep]) {
            acc[buildingStep] = [];
          }
          acc[buildingStep].push(element);
          return acc;
        }, {} as { [key: string]: buildingElement[] });
      }
      return {};
    };

    useEffect(() => {
      if(buildingElements)
      {
        const taskGroup = groupElements(buildingElements,"BuildingStep");
        const stationGroup = groupElements(buildingElements,"Station");
        if(taskGroup)
          {
            console.log("task groups", taskGroup)
            setTaskGroups(taskGroup);
          }
        if(stationGroup)
        {
          console.log("Station groups", stationGroup)
          setStationGroup(stationGroup);
        }
      }
    }, [buildingElements]);

      const TaskBoxStyle = {
        backgroundColor: colors.primary[400],
        border: '1px solid #ccc',
        padding: '10px',
        width: "300px",
        margin: '10px 0',
        borderRadius: '12px',
        cursor: 'pointer',
      };

      const HeaderBoxStyle = {
        backgroundColor: colors.primary[400],
        // border: '1px solid #ccc',
        padding: '10px',
        width: "300px",
        margin: '20px',
        borderRadius: '8px',
        cursor: 'grab',
      };

    return(<>
        <Draggable
        handle=".panel-header" >
            <div className="draggable-panel" style={{
            position: 'fixed',
            top: '10%',
            left: 0,
            transform: 'translateY(-50%)',
            zIndex: 500,
            padding: '10px',
            width:350,
            // border: '1px solid #ccc'

            }}>
        <Box component="div" 
            className="panel-header"
            width='100%' 
            style={HeaderBoxStyle} 
            display="flex" 
            alignItems="right"
            justifyContent='space-between'>
            <Typography noWrap
              variant="h6" 
              sx={{ flexGrow: 1 }} 
            > Station groups</Typography>
              <IconButton size="small" sx={{ marginLeft: '16px', color: colors.grey[300] }} onClick={() => {
                hideAll()
                setStationsVisible(!stationsVisible);
                }}>
                {true ? <TocIcon/> : <TocIcon/>} 
              </IconButton>
            </Box>
        <div>
        <Box
          component="div"
          m="20px"
          width="100%"
          padding="0px"
          maxWidth="80vw"
          maxHeight={"70vh"}
          // boxShadow= '0 0 10px rgba(0, 0, 0, 0.1)'
          overflow="auto"
        >
          {stationsVisible && Object.keys(stationGroup).length > 1 &&  Object.keys(stationGroup).map((group) => (
            <Box component="div" width='100%' >
            <Box component="div" 
            onClick={() => { 
              console.log('clicked station',group)
              setSelectedBuildingElements(stationGroup[group])}}
              width='100%' 
              style={{
                // backgroundColor: colors.primary[400],
                border: '1px solid #ccc',
                padding: '10px',
                width: "280px",
                margin: '10px 0',
                borderRadius: '12px',
                cursor: 'pointer',
                // '&:hover': {backgroundColor: theme.palette.primary[300]},
              }} 
              display="flex" 
              alignItems="center"
              justifyContent='space-between'>

              <Typography noWrap
              maxWidth={'150px'}
                variant="h6" 
                sx={{ flexGrow: 1 }} 
              >{group}</Typography>

              <Typography 
              color={colors.primary[300]}
                 noWrap
                variant="body2" 
                sx={{ marginLeft: '16px' }}
                >count : {stationGroup[group].length}
              </Typography>

              <IconButton size="small" sx={{ marginLeft: '8px', color: colors.grey[300] }} 
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility('Station',group);
              }}>
                {visibility[group] ? <VisibilityOffOutlinedIcon/> : <VisibilityOutlinedIcon/>} 
              </IconButton>

              <IconButton size="small" sx={{ marginLeft: '4px', color: colors.grey[500] }} onClick={(e) => {
                e.stopPropagation();
                toggleNestedListVisibility(group)
                }}>
                {visibility[group] ? <TocIcon/> : <TocIcon/>} 
              </IconButton>
            </Box>

            {/* // here add fold down to */}
            {nestedListVisible[group] && (
            <Box component="div" style={{ marginLeft: '20px', marginTop: '10px' }}>
            {Object.entries(groupElements(stationGroup[group], 'BuildingStep')).map(([buildingStep, elements]) => (
              <Box key={buildingStep} component="div" style={{ marginBottom: '2px' }}>
                <Box component="div" 
                onClick={() => { 
                  console.log('clicked building step', buildingStep)
                  setSelectedBuildingElements(elements)}}
                width='100%' 
                style={{
                  backgroundColor: colors.primary[400],
                  border: '1px solid #ccc',
                  padding: '5px',
                  width: "280px",
                  height: "35px",
                  margin: '5px 0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  // '&:hover': {backgroundColor: theme.palette.primary[300]},
                }} 
                display="flex" 
                alignItems="center"
                justifyContent='space-between'>
                  <Typography noWrap
                  maxWidth={'150px'}
                    variant="h6" 
                    sx={{ flexGrow: 1 }} 
                  >{`Step: ${buildingStep}`}</Typography>
                  <Typography 
                  color={colors.primary[300]}
                    noWrap
                    variant="body2" 
                    sx={{ marginLeft: '16px' }}
                    >count : {elements.length}
                  </Typography>
                <IconButton size="small" sx={{ marginLeft: '8px', color: colors.grey[500] }} onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility('BuildingStep',buildingStep)}}>
                  {visibility[buildingStep] ? <VisibilityOffOutlinedIcon/> : <VisibilityOutlinedIcon/>} 
                </IconButton>
                </Box>
              </Box>
            ))}
            </Box>
          )}
          </Box>
        ))
        }       
        </Box>
        </div>
        </div>        
    </Draggable>
    </>)
}


export default TaskOverViewPanel;