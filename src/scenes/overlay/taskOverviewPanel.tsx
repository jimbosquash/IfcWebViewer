import { Box, useTheme, Typography, IconButton } from "@mui/material";
import Draggable from "react-draggable";
import { tokens } from "../../theme";
import { buildingElement } from "../../utilities/BuildingElementUtilities";
import TocIcon from "@mui/icons-material/Toc";
import { useContext, useEffect, useState } from "react";
import { ModelStateContext } from "../../context/ModelStateContext";
import StationBox from "./StationBox";

const TaskOverViewPanel = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const modelState = useContext(ModelStateContext);
    const [stations, setStationGroup] = useState<Map<string, buildingElement[]>>();

    const [stationsVisible, setStationsVisible] = useState<boolean>(true);

    useEffect(() => {
      if(!modelState?.groups)
        {
          setStationGroup(new Map<string,buildingElement[]>());
          return; // todo should clear groups
        }
      const stations = modelState.groups.get("Station");
      if(stations)
        setStationGroup(stations)
    },[modelState?.groups])

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
            style={HeaderBoxStyle} 
            display="flex" 
            alignItems="center"
            justifyContent='space-between'>
            <Typography noWrap
              variant="h6" 
              sx={{ flexGrow: 1 }} 
            > Station groups</Typography>
              <IconButton size="small" sx={{ marginLeft: '16px', color: colors.grey[300] }} onClick={() => {
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
{stationsVisible && stations && (Array.from(stations).map(([name, elements],index) => (
    <StationBox
      key={index}
      elements={elements}
      stationName={name}
    />
  ))
)}
        </Box>
        </div>
      </div>        
    </Draggable>
  </>)
}


export default TaskOverViewPanel;