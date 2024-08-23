import { Box, useTheme, Typography, IconButton, Paper } from "@mui/material";
import Draggable from "react-draggable";
import { tokens } from "../../../theme";
import TocIcon from "@mui/icons-material/Toc";
import ElementTable from "../../../components/ElementTable";
import { BuildingElement } from "../../../utilities/types";


export const PropertyOverViewPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const HeaderBoxStyle = {
    // backgroundColor: colors.primary[400],
    // border: '1px solid #ccc',
    padding: "10px",
    width: "300px",
    margin: "20px",
    borderRadius: "8px",
    cursor: "grab",
  };

  return (
    <>
      <Paper
        style={{
          position: "fixed",
          margin: "10px",
          top: "10%",
          right: 0,
          transform: "translateY(-50%)",
          zIndex: 500,
          padding: "5px",
          width: 350,
          // border: '1px solid #ccc'
        }}
      >
        {/* <Box component="div">
          <Typography noWrap variant="h6" sx={{ flexGrow: 1 }}>
            {" "}
            Properties
          </Typography>
          <IconButton size="small" sx={{ marginLeft: "16px", color: colors.grey[300] }} onClick={() => {}}>
            {true ? <TocIcon /> : <TocIcon />}
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
          boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
          overflow="auto"
        >
          {buildingElements && <ElementTable isDashboard={false} buildingElements={buildingElements} />}
        </Box> */}
      </Paper>
    </>
  );
};

export default PropertyOverViewPanel;
