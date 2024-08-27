import { Box, useTheme, Paper, Tabs, Tab, TabProps } from "@mui/material";
import { tokens } from "../../../theme";
import { useState } from "react";
import AssemblyInfoPanel from "../../../../archive/AssemblyInfoPanel";

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
      style={{ height: "92%", width: "100%" }}
      {...other}
    >
      {value === index && (
        <Box component={"div"} sx={{ p: 0, height: "100%", width:'100%', overflow: "clip", flexGrow: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const PropertyOverViewPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [value, setValue] = useState(0);

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
        <Box 
        component='div'
          style={{
            height: "100%",
            padding: "0px",
            boxSizing: "border-box",
          }}
        >
          <Box component={"div"} sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <StyledTab label="Assembly" {...a11yProps(0)} index={0} />
              <StyledTab label="Elements" {...a11yProps(1)} index={1} />
              {/* <StyledTab label="Settings" {...a11yProps(2)} index={2} /> */}
            </Tabs>
          </Box>
          <Box component={"div"} height="100%">
            <CustomTabPanel value={value} index={1}>
              Elements
            </CustomTabPanel>
            <CustomTabPanel value={value} index={0}>
              <AssemblyInfoPanel />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              Settings
            </CustomTabPanel>
          </Box>
        </Box>
    </>
  );
};

export default PropertyOverViewPanel;
