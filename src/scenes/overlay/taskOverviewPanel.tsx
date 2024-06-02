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
    ifcModel : FRAGS.FragmentsGroup;
    components: OBC.Components;

}

const TaskOverViewPanel: React.FC<taskOverviewProps> = ({components, ifcModel, buildingElements}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [taskGroups, setTaskGroups] = useState<{[key: string]: buildingElement[]}>({});
    const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});


    const toggleVisibility = async (buildingStep: string) => {
      setVisibility((prevVisibility) => ({
        ...prevVisibility,
        [buildingStep]: !prevVisibility[buildingStep],
      }));
      
      //console.log("task set to active", taskGroups[buildingStep]);

      const fragments = components.get(OBC.FragmentsManager);
      const exporessIds = taskGroups[buildingStep].map((e) => {return e.expressID})
      const taskFragments = GetFragmentsFromExpressIds(exporessIds,fragments,ifcModel);

      for(const fragmentType of taskFragments)
      {
        fragmentType[0].setVisibility(visibility[buildingStep],fragmentType[1])
      }
    };

    useEffect(() => {
      const groupElements = () => {
        return buildingElements.reduce((acc, element) => {
          const buildingStep = element.properties.find(prop => prop.name === 'Station')?.value || 'Unknown'; //BuildingStep | station
          if (!acc[buildingStep]) {
            acc[buildingStep] = [];
          }
          acc[buildingStep].push(element);
          return acc;
        }, {} as { [key: string]: buildingElement[] });
      };
  
      setTaskGroups(groupElements());
    }, [buildingElements]);
    
    

      const TaskBoxStyle = {
        backgroundColor: colors.primary[400],
        border: '1px solid #ccc',
        padding: '10px',
        width: "300px",
        margin: '10px 0',
        borderRadius: '4px',
        cursor: 'pointer',
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
        <div className="panel-header" style={{ cursor: 'grab', padding: '5px'}}>
            <h3 > Task List</h3>
        </div>
        <div>
        <Box
          component="div"
          m="20px"
          width="100%"
          padding="0px"
          maxWidth="80vw"
          maxHeight={"70vh"}
          boxShadow= '0 0 10px rgba(0, 0, 0, 0.1)'
          overflow="auto"
        >

          {Object.keys(taskGroups).length > 1 &&  Object.keys(taskGroups).map((buildingStep) => (
            <Box component="div" 
              width='100%' 
              style={TaskBoxStyle} 
              display="flex" 
              alignItems="right"
              justifyContent='space-between'>
              <Typography noWrap
                variant="h6" 
                sx={{ flexGrow: 1 }} 
              >{buildingStep}</Typography>
              <Typography 
              color={colors.grey[300]}
                 noWrap
                variant="body1" 
                sx={{ marginLeft: '16px' }}
                >count : {taskGroups[buildingStep].length}
              </Typography>
              <IconButton size="small" sx={{ marginLeft: '16px' }} onClick={() => toggleVisibility(buildingStep)}>
                {visibility[buildingStep] ? <VisibilityOffOutlinedIcon/> : <VisibilityOutlinedIcon/>} 
              </IconButton>
              {/* <Button
                variant="contained"
                color="primary"
                onClick={() => toggleVisibility(buildingStep)}
              >
                {visibility[buildingStep] ? 'hide' : 'show'} Geometry
              </Button> */}
            </Box>
          ))}
        </Box>
        </div>
        </div>        
    </Draggable>
    </>)
}


export default TaskOverViewPanel;