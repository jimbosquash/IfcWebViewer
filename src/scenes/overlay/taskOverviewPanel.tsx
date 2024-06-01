import { Box, useTheme,styled } from "@mui/material";
// import { styled } from "@mui/system";
import Draggable from "react-draggable";
import { tokens } from "../../theme";
import { buildingElement } from "../../utilities/IfcUtilities";
import TaskBox from "./taskBox";
import TocIcon from "@mui/icons-material/Toc";

interface taskOverviewProps {
    buildingElements: buildingElement[];
}

const TaskOverViewPanel: React.FC<taskOverviewProps> = ({buildingElements}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);   
    
    const DraggablePanelContainer = ({
        position: 'fixed',
        top: '50%',
        left: 0,
        transform: 'translateY(-50%)',
        backgroundColor: '',
        // border: '1px solid #ccc',
        // boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        padding: '20px',
        width: '300px',
      });

      const TaskBoxStyle = {
        backgroundColor: colors.primary[400],
        border: '1px solid #ccc',
        padding: '10px',
        width: "300px",
        margin: '10px 0',
        borderRadius: '4px',
        cursor: 'pointer',
        // textAlign: 'center',
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
            padding: '20px',
            width:350,
            }}>
        <div className="panel-header" style={{ cursor: 'grab', padding: '12px'}}>
            <h3 > Building Elements</h3>
        </div>
        <div>
        <Box
          component="div"
          m="20px"
          width="100%"
          maxWidth="80vw"
          overflow="hidden"
        >
        {/* <TaskBox title="Ceiling" subtitle="HVAC" icon={TocIcon}/> */}
          <Box component="div" style={TaskBoxStyle}>
            Ceiling Secondary Beams
          </Box>
          <Box component="div" style={TaskBoxStyle}>
            Ceiling - Hvac Instillation
          </Box>
          <Box component="div" style={TaskBoxStyle}>
            Ceiling - Insulation
          </Box>
        </Box>
        </div>
        </div>        
    </Draggable>
    </>)
}


export default TaskOverViewPanel;