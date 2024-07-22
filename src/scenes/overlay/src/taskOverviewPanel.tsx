import { Box, useTheme, Typography, IconButton } from "@mui/material";
import { tokens } from "../../../theme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useContext, useEffect, useState } from "react";
import StationBox from "./StationBox";
import { useModelContext } from "../../../context/ModelStateContext";
import { buildingElement } from "../../../utilities/BuildingElementUtilities";
import { ComponentsContext } from "../../../context/ComponentsContext";
import { ModelViewManager } from "../../../bim-components/modelViewer";

const TaskOverViewPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { groups } = useModelContext();
  const components = useContext(ComponentsContext);
  const [stations, setStationGroup] = useState<Map<string, buildingElement[]>>();
  const [stationsVisible, setStationsVisible] = useState<boolean>(true);

  useEffect(() => {
    if (!components) return;

    let viewManager = components.get(ModelViewManager);
    viewManager.onGroupsChanged.add((data) => handleGroupChange(data));
    if(viewManager.Groups)
      {
        handleGroupChange(viewManager.Groups)
      }

    return () => {
      viewManager.onGroupsChanged.remove((data) => handleGroupChange(data));
    };
  }, [components]);


  useEffect(() => {
    console.log("TaskOverViewPanel : changing station visibility",)
    

  }, [stationsVisible])



  const handleGroupChange = (data: Map<string, Map<string, buildingElement[]>>) => {
    console.log("task over view panel handeling new groups:", data);
    const stations = data.get("Station");
    if (stations) setStationGroup(stations);
  };

  useEffect(() => {
    console.log("taskViewPanel: new Stations:", stations)
  
    return () => {
      
    }
  }, [stations])
  

  const HeaderBoxStyle = {
    // backgroundColor: colors.primary[400],
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    // border: '1px solid #ccc',
    padding: "5px",
    width: "240px",
    margin: "10px",
    borderRadius: "8px",
    cursor: "grab",
  };

  return (
    <>
      <div
        className="draggable-panel"
        style={{
          position: "absolute",
          top: "10%",
          left: 0,
          // transform: "translateY(-50%)",
          zIndex: 500,
          padding: "15px",
          width: 350,
          // border: '1px solid #ccc'
        }}
      >
        <Box
          component="div"
          className="panel-header"
          style={HeaderBoxStyle}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography noWrap variant="h6" sx={{ flexGrow: 1 }}>
            {" "}
            Station groups
          </Typography>
          <IconButton
            size="small"
            sx={{ marginLeft: "16px", color: colors.grey[300] }}
            onClick={() => {
              setStationsVisible(!stationsVisible);
            }}
          >
            {stationsVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
            {stationsVisible &&
              stations &&
              Array.from(stations).map(([name, elements], index) => (
                <StationBox key={index} elements={elements} stationName={name} />
              ))}
          </Box>
        </div>
      </div>
    </>
  );
};

export default TaskOverViewPanel;
