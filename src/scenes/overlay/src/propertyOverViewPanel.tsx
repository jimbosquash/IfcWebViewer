import { Box, useTheme, Typography, IconButton, Paper, Tabs, Tab, TabProps, Grid } from "@mui/material";
import Draggable from "react-draggable";
import { tokens } from "../../../theme";
import TocIcon from "@mui/icons-material/Toc";
import ElementTable from "../../../components/ElementTable";
import { BuildingElement } from "../../../utilities/types";
import { useState } from "react";
import AssemblyInfoPanel from "./AssemblyInfoPanel";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ height: '92%', width:"100%"}}
      {...other}
    >
      {value === index && (
        <Box component={"div"} sx={{ p: 1, height: "100%", overflow: "clip",flexGrow: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const PropertyOverViewPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [value, setValue] = useState(1);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  interface StyledTabProps extends TabProps {
    index: number;
  }

  const StyledTab: React.FC<StyledTabProps> = ({ label, index, ...props }) => (
    <Tab
      label={label}
      id={`simple-tab-${index}`}
      aria-controls={`simple-tabpanel-${index}`}
      sx={{
        "&.Mui-selected": {
          color: colors.greenAccent[400],
        },
      }}
      {...props}
    />
  );

  return (
    <>
      <Paper
        style={{
          position: "fixed",
          margin: "10px",
          top: "10%",
          bottom: "20%",
          right: 0,
          transform: "translateY(0%)",
          zIndex: 50,
          padding: "5px",
          minWidth: 350,
          // border: '1px solid #ccc'
        }}
      >
        <Box component={"div"} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <StyledTab label="Elements" {...a11yProps(0)} index={0} />
            <StyledTab label="Assembly" {...a11yProps(1)} index={1} />
            <StyledTab label="Settings" {...a11yProps(2)} index={2} />
          </Tabs>
        </Box>
        <Box component={"div"} height="100%">
        <CustomTabPanel value={value} index={0}>
          Elements
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <AssemblyInfoPanel/>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          Settings
        </CustomTabPanel>
        </Box>
        
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
