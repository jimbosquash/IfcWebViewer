import { Box, Button, ButtonGroup,IconButton,useTheme } from "@mui/material"
import React from "react"
import Draggable from "react-draggable"
import { tokens } from "../../theme"
import { styled } from '@mui/system';
import TocIcon from "@mui/icons-material/Toc";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';




  
  const FloatingButtonGroup = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);



    return (
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
            <IconButton style={floatingButtonStyle}>
              < TocIcon fontSize="large"/>
            </IconButton>
            <IconButton style={floatingButtonStyle}>
              < NavigateNextIcon fontSize="large" />
            </IconButton>
          </ButtonGroup>
        </div>
      </Draggable>
    );
  };

  const floatingButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      fontSize: "small" 
  }
  
  export default FloatingButtonGroup;