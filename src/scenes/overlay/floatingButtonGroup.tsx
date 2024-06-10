import { Box, Button, ButtonGroup,IconButton,useTheme } from "@mui/material"
import React, { createRef, useContext, useEffect, useState } from "react"
import Draggable from "react-draggable"
import { tokens } from "../../theme"
import { styled } from '@mui/system';
import TocIcon from "@mui/icons-material/Toc";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import TaskOverViewPanel from "./taskOverviewPanel";
import PropertyOverViewPanel from "./propertyOverViewPanel"
import { buildingElement } from "../../utilities/IfcUtilities";
import * as FRAGS from '@thatopen/fragments';
import * as OBC from "@thatopen/components";
import { BuildingElementsContext } from "../../context/BuildingElementsContext";



interface taskOverviewProps {
  ifcModel : FRAGS.FragmentsGroup | undefined;
}
  
  const FloatingButtonGroup:React.FC<taskOverviewProps> = ({ifcModel}) => {
    const buildingElements = useContext(BuildingElementsContext);
    const [isGroupPanelVisible, setIsGroupPanelVisible] = useState(false);
    const [isPropertyPanelVisible, setIsPropertyPanelVisible] = useState(false);
    const [selectedBuildingElements, setSelectedBuildingElements] = useState<buildingElement[]>([]);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const handleSelectedElementsChange = (selectedElements : buildingElement[]) => {
      if(selectedElements)
      {
        setSelectedBuildingElements(selectedElements);
      }
    }

    const togglePanelVisibility = () => {
      console.log('panel vis set')
      setIsGroupPanelVisible((prevVisibility) => !prevVisibility);
    };

    const togglePropertyPanelVisibility = () => {
      console.log('property panel vis set')
      setIsPropertyPanelVisible((prevVisibility) => !prevVisibility);
    };


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
          }
        } 
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
              <IconButton style={floatingButtonStyle}>
                < NavigateNextIcon fontSize="large" />
              </IconButton>
            </ButtonGroup>
          </div>
        </Draggable>
        {isGroupPanelVisible && (
          <TaskOverViewPanel ifcModel={ifcModel} onSelectedElementsChange={handleSelectedElementsChange}/> )}
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