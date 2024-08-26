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
        <Box component={"div"} sx={{ p: 1, height: "100%", overflow: "clip", flexGrow: 1 }}>
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
  const [width, setWidth] = useState(350); // Initial width of the Paper

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleResize = (event: any, { size }: any) => {
    console.log("handling resize")
    setWidth(size.width);
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
      {/* <ResizableBox
        width={width}
        height={Infinity}
        minConstraints={[350, 0]}
        maxConstraints={[500, Infinity]}
        axis="x"
        handle={<div
          style={{
            width: '10px',
            cursor: 'ew-resize',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        />} // Resize handle on the west (left) side
        onResize={handleResize}
        style={{ position: "fixed", top: "10%", bottom: "20%", right: 0, zIndex: 500 }}
      > */}
        <Paper
          style={{
            height: "100%",
            padding: "5px",
            boxSizing: "border-box",
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
              <AssemblyInfoPanel />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              Settings
            </CustomTabPanel>
          </Box>
        </Paper>
      {/* </ResizableBox> */}
    </>
  );
};

export default PropertyOverViewPanel;
