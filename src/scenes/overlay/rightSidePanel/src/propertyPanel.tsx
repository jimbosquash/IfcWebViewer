import { Box, Tabs } from "@mui/material";
import { useState } from "react";
import AssemblyInfoPanel from "./AssemblyInfoPanel";
import ElementInfoPanel from "./ElementInfoPanel";
import CustomTabPanel from "../../../../components/CustomTabPanel";
import StyledTab from "../../../../components/StyledTab";

export const PropertiesPanel = () => {
  const [value, setValue] = useState(0);

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
            <Tabs value={value} onChange={(event: React.SyntheticEvent, newValue: number) => setValue(newValue)}>
            <StyledTab label="Element" index={0} />
              <StyledTab label="Assembly" index={1} />
            </Tabs>
          </Box>
          <Box component={"div"} height="100%">
            <CustomTabPanel value={value} index={0}>
              <ElementInfoPanel/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <AssemblyInfoPanel />
            </CustomTabPanel>
          </Box>
        </Box>
    </>
  );
};

export default PropertiesPanel;
