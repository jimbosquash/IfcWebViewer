import { Box, useTheme,styled, Typography, Button, IconButton } from "@mui/material";
// import { styled } from "@mui/system";
import Draggable from "react-draggable";
import { tokens } from "../../theme";
import { buildingElement, GetFragmentsFromExpressIds } from "../../utilities/IfcUtilities";
import TaskBox from "./taskBox";
import TocIcon from "@mui/icons-material/Toc";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useEffect, useState } from "react";
import * as FRAGS from '@thatopen/fragments';
import * as OBC from "@thatopen/components";
import { Color } from "three/src/Three";

interface taskOverviewProps {
    buildingElements: buildingElement[];
    ifcModel : FRAGS.FragmentsGroup | undefined;
    components: OBC.Components | undefined;

}

const TaskOverViewPanel: React.FC<taskOverviewProps> = ({components, ifcModel, buildingElements}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [taskGroups, setTaskGroups] = useState<{[key: string]: buildingElement[]}>({});
    const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
    const [sortingType, setSortingStyle] = useState<string>("BuildingStep");
    // isolatye mode = turns everything to hidden


    const changeSrtType = () => {
      if(sortingType === "BuildingStep")
        setSortingStyle("Station")
      else
        setSortingStyle("BuildingStep")

        console.log("sort style", sortingType)
        


    }

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

    const toggleVisibility = async (buildingStep: string) => {
      setVisibility((prevVisibility) => ({
        ...prevVisibility,
        [buildingStep]: !prevVisibility[buildingStep],
      }));
      
      //console.log("task set to active", taskGroups[buildingStep]);
      if(components)
      {
        const fragments = components.get(OBC.FragmentsManager);
        const exporessIds = taskGroups[buildingStep].map((e) => {return e.expressID})
        const taskFragments = GetFragmentsFromExpressIds(exporessIds,fragments,ifcModel);

        for(const fragmentType of taskFragments)
        {
          fragmentType[0].setVisibility(visibility[buildingStep],fragmentType[1])
        }
      }
    };

    useEffect(() => {
      const groupElements = () => {
        return buildingElements.reduce((acc, element) => {
          const buildingStep = element.properties.find(prop => prop.name === sortingType)?.value || 'Unknown'; //BuildingStep | station
          if (!acc[buildingStep]) {
            acc[buildingStep] = [];
          }
          acc[buildingStep].push(element);
          return acc;
        }, {} as { [key: string]: buildingElement[] });
      };
  
      setTaskGroups(groupElements());
    }, [buildingElements,sortingType]);
    
    

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
            > {sortingType} List</Typography>
              <IconButton size="small" sx={{ marginLeft: '16px' }} onClick={changeSrtType}>
              { sortingType === "buildingStep" ? <TocIcon/> : <TocIcon/>}
              </IconButton>
              <IconButton size="small" sx={{ marginLeft: '16px', color: colors.grey[300] }} onClick={() => hideAll()}>
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

          {Object.keys(taskGroups).length > 1 &&  Object.keys(taskGroups).map((buildingStep) => (
            <Box component="div" 
              width='100%' 
              style={{
                // backgroundColor: colors.primary[400],
                border: '1px solid #ccc',
                padding: '10px',
                width: "300px",
                margin: '10px 0',
                borderRadius: '12px',
                cursor: 'pointer',
                // '&:hover': {backgroundColor: theme.palette.primary[300]},
              }} 
              display="flex" 
              alignItems="right"
              justifyContent='space-between'>
              <Typography noWrap
              maxWidth={'150px'}
                variant="h6" 
                sx={{ flexGrow: 1 }} 
              >{buildingStep}</Typography>
              <Typography 
              color={colors.primary[300]}
                 noWrap
                variant="body1" 
                sx={{ marginLeft: '16px' }}
                >count : {taskGroups[buildingStep].length}
              </Typography>
              <IconButton size="small" sx={{ marginLeft: '16px', color: colors.grey[300] }} onClick={() => toggleVisibility(buildingStep)}>
                {visibility[buildingStep] ? <VisibilityOffOutlinedIcon/> : <VisibilityOutlinedIcon/>} 
              </IconButton>
              
            </Box>
          ))}
        </Box>
        </div>
        
        </div>        
    </Draggable>
    </>)
}


export default TaskOverViewPanel;