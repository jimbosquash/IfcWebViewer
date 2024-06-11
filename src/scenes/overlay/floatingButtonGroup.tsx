import { ButtonGroup,IconButton,useTheme } from "@mui/material"
import React, { useContext, useState } from "react"
import Draggable from "react-draggable"
import { tokens } from "../../theme"
import TocIcon from "@mui/icons-material/Toc";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import ZoomInMapOutlined from '@mui/icons-material/ZoomInMapOutlined';
import TaskOverViewPanel from "./taskOverviewPanel";
import PropertyOverViewPanel from "./propertyOverViewPanel"
import { buildingElement } from "../../utilities/IfcUtilities";
import * as FRAGS from '@thatopen/fragments';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { ComponentsContext } from "../../context/ComponentsContext";

interface taskOverviewProps {
  ifcModel : FRAGS.FragmentsGroup | undefined;
}
  
const FloatingButtonGroup:React.FC<taskOverviewProps> = ({ifcModel}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useContext(ComponentsContext);
  const [isGroupPanelVisible, setIsGroupPanelVisible] = useState(false);
  const [isPropertyPanelVisible, setIsPropertyPanelVisible] = useState(false);
  const [selectedBuildingElements, setSelectedBuildingElements] = useState<buildingElement[]>([]);
  
  const togglePanelVisibility = () => {
    // console.log('station panel visibility set',!prevVisibility)
    setIsGroupPanelVisible((prevVisibility) => !prevVisibility);
  };

  const togglePropertyPanelVisibility = () => {
    // console.log('property panel vis set',!prevVisibility)
    setIsPropertyPanelVisible((prevVisibility) => !prevVisibility);
  };

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
      <Draggable handle=".draggable-handle" >
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
          className="draggable-handle"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            cursor: 'grab',
          }}
        >
        <DragIndicatorIcon />
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
          <IconButton style={floatingButtonStyle}>
            < NavigateNextIcon fontSize="large" />
          </IconButton>
        </ButtonGroup>
      </div>
      </Draggable>
      {isGroupPanelVisible && (
        <TaskOverViewPanel ifcModel={ifcModel} onSelectedElementsChange={(selectedElements) => {selectedElements && setSelectedBuildingElements(selectedElements)}}/> )}
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