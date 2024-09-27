import { Box, Tabs } from "@mui/material";
import { useState } from "react";
import AssemblyInfoPanel from "./AssemblyInfoPanel";
import ElementInfoPanel from "./ElementInfoPanel";
import CustomTabPanel from "../../../../components/CustomTabPanel";
import StyledTab from "../../../../components/StyledTab";
import ModelInfoPanel from "./modelInfoPanel";

export const PropertiesPanel = () => {
  const [value, setValue] = useState(0);

  return (
    <>
      <Box
        component="div"
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box component={"div"} sx={{ borderBottom: 1, borderColor: "divider",flexShrink: 0 }}>
          <Tabs value={value} onChange={(event: React.SyntheticEvent, newValue: number) => setValue(newValue)}>
            <StyledTab label="Element" index={0} />
            <StyledTab label="Assembly" index={1} />
            <StyledTab label="Model" index={2} />
          </Tabs>
        </Box>
        <Box component={"div"} height="100%"
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          // Ensure padding at the bottom for better UX when scrolling
          paddingBottom: "50px",
        }}
        >
          <CustomTabPanel value={value} index={0}>
            <ElementInfoPanel />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <AssemblyInfoPanel />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <ModelInfoPanel />
          </CustomTabPanel>
        </Box>
      </Box>
    </>
  );
};

export default PropertiesPanel;
