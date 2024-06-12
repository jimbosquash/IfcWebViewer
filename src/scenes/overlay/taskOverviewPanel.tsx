import { Box, useTheme, Typography, IconButton } from "@mui/material";
import Draggable from "react-draggable";
import { tokens } from "../../theme";
import { GetFragmentsFromExpressIds } from "../../utilities/IfcUtilities";
import { buildingElement, groupElements } from "../../utilities/BuildingElementUtilities";
import TocIcon from "@mui/icons-material/Toc";
import { useContext, useEffect, useState } from "react";
import * as FRAGS from '@thatopen/fragments';
import * as OBC from "@thatopen/components";
import { BuildingElementsContext } from "../../context/BuildingElementsContext";
import { ComponentsContext } from "../../context/ComponentsContext";
import StationBox from "./StationBox";

interface taskOverviewProps {
    ifcModel : FRAGS.FragmentsGroup | undefined;
    onSelectedElementsChange : (buildingElements : buildingElement[]) => void;
}


const TaskOverViewPanel = ({ifcModel, onSelectedElementsChange} : taskOverviewProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const buildingElements = useContext(BuildingElementsContext);
    const components = useContext(ComponentsContext);
    const [taskGroups, setTaskGroups] = useState<{[key: string]: buildingElement[]}>({});
    const [stationGroup, setStationGroup] = useState<{[key: string]: buildingElement[]}>({});
    const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
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

    const getVisibility = (groupName: string) : boolean => {
      return visibility[groupName]
    }


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

      const HeaderBoxStyle = {
        // backgroundColor: colors.primary[400],
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        // border: '1px solid #ccc',
        padding: '5px',
        width: "240px",
        margin: '10px',
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
            // width='100%' 
            style={HeaderBoxStyle} 
            display="flex" 
            alignItems="center"
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
          m="10px"
          maxHeight="70vh"
          overflow="auto"
          // width="100%"
          // padding="0px"
          // maxWidth="80vw"
          // boxShadow= '0 0 10px rgba(0, 0, 0, 0.1)'
        >
          {stationsVisible && Object.keys(stationGroup).length > 1 &&  Object.keys(stationGroup).map((group) => (  
          <StationBox
          elements={stationGroup[group]}
          stationName={group}
          setSelectedElements={setSelectedBuildingElements}
          toggleElementVisibility={toggleVisibility}
          getVisibility={getVisibility}
          />
        ))
        }       
        </Box>
        </div>
      </div>        
    </Draggable>
  </>)
}


export default TaskOverViewPanel;