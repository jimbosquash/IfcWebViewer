import { Box, ButtonGroup,IconButton,useTheme } from "@mui/material"
import React, { useContext, useEffect, useRef, useState } from "react"
import { tokens } from "../../theme"
import TocIcon from "@mui/icons-material/Toc";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import ZoomInMapOutlined from '@mui/icons-material/ZoomInMapOutlined';
import TaskOverViewPanel from "./taskOverviewPanel";
import PropertyOverViewPanel from "./propertyOverViewPanel"
import { buildingElement, GetNextGroup, SelectionGroup } from "../../utilities/BuildingElementUtilities";
import * as FRAGS from '@thatopen/fragments';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { ComponentsContext } from "../../context/ComponentsContext";
import { ModelStateContext } from "../../context/ModelStateContext";

interface taskOverviewProps {
  ifcModel : FRAGS.FragmentsGroup | undefined;
}
  
const FloatingButtonGroup:React.FC<taskOverviewProps> = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useContext(ComponentsContext);
  const modelState = useContext(ModelStateContext);
  const [isGroupPanelVisible, setIsGroupPanelVisible] = useState(false);
  const [isPropertyPanelVisible, setIsPropertyPanelVisible] = useState(false);
  const [selectedBuildingElements, setSelectedBuildingElements] = useState<buildingElement[]>([]);
  // const [currentGroup, setCurrentGroup] = useState<SelectionGroup>();
  
  useEffect(() => {
    if(modelState?.selectedGroup)
    {
      // setCurrentGroup(modelState.selectedGroup);
      setSelectedBuildingElements(modelState.selectedGroup.elements)
    }
  },[modelState?.selectedGroup])

  const togglePanelVisibility = () => {
    // console.log('station panel visibility set',!prevVisibility)
    setIsGroupPanelVisible((prevVisibility) => !prevVisibility);
  };

  const togglePropertyPanelVisibility = () => {
    // console.log('property panel vis set',!prevVisibility)
    setIsPropertyPanelVisible((prevVisibility) => !prevVisibility);
  };

  const setNextGroup = () => {
    if(!modelState?.groups) return;

    if(!modelState.selectedGroup)
    {
      console.log("No group selected, default will be used")
    }
    const nextGroup = GetNextGroup(modelState?.selectedGroup,modelState.groups);
    if(nextGroup)
    {
      console.log("Next group found and setting", nextGroup)

      modelState.setSelectedGroup(nextGroup)

      // hide all groups 
      // show this group
      // use the group state
      const visMap = new Map(modelState?.groupVisibility);
      visMap.forEach((visState, groupName) => visMap.set(groupName,true));
      const matchingGroupType = modelState?.groups.get(nextGroup.groupType)?.keys();
      if(!matchingGroupType) return;

      for(let groupName of Array.from(matchingGroupType))
      {
        if(groupName !== nextGroup.groupName)
  	        visMap.set(groupName,false)

      }
      console.log("new vis map set", visMap)
      modelState?.setGroupVisibility(visMap)
      }

    }
  

  const zoomToAll = () => {
    if(components)
    {
      const worlds = components.get(OBC.Worlds);
      console.log('get worlds', worlds.list.values().next().value.name)
      console.log('get worlds', worlds)
      for(const world of worlds?.list.values())
      {
        if(world instanceof OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer>  )
        {
          if(world && world.name === 'Main')
          {
            setTimeout(async () => {
              if(world.camera instanceof OBC.OrthoPerspectiveCamera)
                world.camera.fit(world.meshes, 0.8)
            }, 50)
          }
        }
        
      }
    }
  }

  return (
    <>
        <Box component={"div"}  >
        <div style={{
          position: 'fixed',
          bottom: 50,
          left: "40%",
          transform: 'translateX(-50%,0)',
          zIndex: 500,
          width:450,
          height: 35,
          cursor: 'grab',
          display: 'inline-block',
          }} 
        >
          <ButtonGroup variant="contained" style={{ backgroundColor:colors.primary[400]}}>
            <div
          >
          {/* <DragIndicatorIcon /> */}
            </div>
            <IconButton style={floatingButtonStyle}>
              < NavigateBeforeIcon fontSize="large"/>
            </IconButton>
            <IconButton style={floatingButtonStyle} onClick={togglePanelVisibility}>
              < TocIcon fontSize="medium"/>
            </IconButton>
            <IconButton style={floatingButtonStyle} onClick={togglePropertyPanelVisibility}>
              < DescriptionOutlined fontSize="small"/>
            </IconButton>
            <IconButton style={floatingButtonStyle} onClick={zoomToAll}>
              < ZoomInMapOutlined fontSize="small"/>
            </IconButton>
            <IconButton style={floatingButtonStyle} onClick={setNextGroup}>
              < NavigateNextIcon fontSize="large" />
            </IconButton>
          </ButtonGroup>
        </div>
        </Box>
        {isGroupPanelVisible && (
          <TaskOverViewPanel/> )}
        {isPropertyPanelVisible && (
          <PropertyOverViewPanel buildingElements={selectedBuildingElements}/> )}
    </>
  );
};

const floatingButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    fontSize: "small" 
}
  
export default FloatingButtonGroup;