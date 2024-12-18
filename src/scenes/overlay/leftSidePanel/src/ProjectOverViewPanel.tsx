import { Box, Tabs } from "@mui/material";
import { useState } from "react";
import CustomTabPanel from "../../../../components/CustomTabPanel";
import { PanelBase } from "../../../../components/PanelBase";
import StyledTab from "../../../../components/StyledTab";
import AssemblyBrowserPanel from "./AssemblyBrowserPanel";
import MaterialBrowserPanel from "./MaterialBrowserPanel";
import StationBrowserPanel from "./StationBrowserPanel";

export const ProjectOverviewPanel = () => {
  const [value, setValue] = useState(0);

  return (
    <>
      <Box
        component="div"
        style={{
          height: "100%",
          width: "100%",
          padding: "0px",
          margin: "0px",
        }}
      >
        <Box component={"div"} sx={{ borderBottom: 1, width: "100%", borderColor: "divider", marginLeft: "0px" }}>
          <Tabs value={value} onChange={(event: React.SyntheticEvent, newValue: number) => setValue(newValue)}>
            <StyledTab label="Station" index={0} />
            <StyledTab label="Assembly" index={1} />
            <StyledTab label="Material" index={1} />
          </Tabs>
        </Box>
        {/* </Box>paddingBottom="20px" */}

        <Box component={"div"} >
          <CustomTabPanel value={value} index={0}>
            <StationBrowserPanel />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <AssemblyBrowserPanel />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <PanelBase
              title="Materials"
              icon="mdi:file-tree-outline"
              body="Building elements grouped by Material type. Double click to select. You can turn visibility on and off
              whilst using assembly groupings."
            >
              <MaterialBrowserPanel />
            </PanelBase>
          </CustomTabPanel>
        </Box>
      </Box>
    </>
  );
};

export default ProjectOverviewPanel;
