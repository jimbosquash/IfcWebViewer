import { Box, Button, ButtonGroup,useTheme } from "@mui/material"
import React from "react"
import Draggable from "react-draggable"
import { tokens } from "../../theme"
import { styled } from '@mui/system';



  
  const FloatingButtonGroup = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);



    return (
      <Draggable handle=".draggable-handle">
      <div style={{
        position: 'fixed',
        bottom: 50,
        left: "40%",
        transform: 'translateX(-50%,0)',
        zIndex: 500,
        width:350,
        height: 35,
        cursor: 'grab',
        display: 'inline-block',
        backgroundColor: colors.primary[400]}
      } 
        className="draggable-handle">
          <ButtonGroup variant="contained" style={{ backgroundColor:colors.primary[400]}}>
            <Button style={{ backgroundColor:colors.primary[400]}}>Previous task</Button>
            <Button>Show all</Button>
            <Button>Next task</Button>
          </ButtonGroup>
        </div>
      </Draggable>
    );
  };
  
  export default FloatingButtonGroup;