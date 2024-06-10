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
import ElementTable from "../../components/ElementTable";


interface PropertyOverViewProps {
    buildingElements : buildingElement[];
}

export const PropertyOverViewPanel = ({buildingElements} : PropertyOverViewProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    useEffect(() => {
      // create collection of elements and show in ui
      console.log('new Properties received',buildingElements)
      return () => {
      }
    }, [buildingElements])
    
    const HeaderBoxStyle = {
        // backgroundColor: colors.primary[400],
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
            margin:'10px',
            top: '10%',
            right: 0,
            transform: 'translateY(-50%)',
            zIndex: 500,
            padding: '5px',
            width:350,
            // border: '1px solid #ccc'
            }}>
                <Box component="div" 
                // className="panel-header"
                width='100%' 
                style={HeaderBoxStyle} 
                display="flex" 
                alignItems="center"
                boxShadow= '0 0 10px rgba(0, 0, 0, 0.1)'
                justifyContent='space-between'>
                <Typography noWrap
                variant="h6" 
                sx={{ flexGrow: 1 }} 
                > Properties</Typography>
                <IconButton size="small" sx={{ marginLeft: '16px', color: colors.grey[300] }} onClick={() => {
                    }}>
                    {true ? <TocIcon/> : <TocIcon/>} 
                </IconButton>
                </Box>
                <Box
                component="div"
                m="20px"
                // width="300px"
                // maxHeight="60vh"
                height="40vh"
                padding="0px"
                // maxWidth="80vw"
                boxShadow= '0 0 10px rgba(0, 0, 0, 0.1)'
                overflow="auto">
                    <ElementTable isDashboard={false} buildingElements={buildingElements}/>
                </Box>
            </div>        
        </Draggable>
    </>)
}

export default PropertyOverViewPanel;