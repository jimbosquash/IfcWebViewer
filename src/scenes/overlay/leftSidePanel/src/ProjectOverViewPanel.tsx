import { Icon } from "@iconify/react";
import { Box, Tabs, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import CustomTabPanel from "../../../../components/CustomTabPanel";
import { PanelBase } from "../../../../components/PanelBase";
import StyledTab from "../../../../components/StyledTab";
import { nonSelectableTextStyle } from "../../../../styles";
import { tokens } from "../../../../theme";
import AssemblyBrowserPanel from "./AssemblyBrowserPanel";
import MaterialBrowserPanel from "./MaterialBrowserPanel";


export const ProjectOverviewPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
            {/* <StyledTab label="Stations" index={0} /> */}
            <StyledTab label="Groups" index={0} />
            <StyledTab label="Material" index={1} />
          </Tabs>
        </Box>
        <Box component={"div"} paddingBottom="20px" height="100%">
          

          <CustomTabPanel value={value} index={0}>
            <PanelBase title='Building stations' icon='mdi:file-tree-outline' body='Building elements grouped by Assembly type. Double click to select. You can turn visibility on and off
                whilst using assembly groupings.'>
            <AssemblyBrowserPanel />

            </PanelBase>
          {/* <Box
              component="div"
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "calc(100vh - 100px)", // Adjust for the marginTop
                marginTop: "20px",
                overflow: "hidden",
                gap: 2,
              }}
            >
              <Box component="div" flexDirection="row" display="flex" marginLeft="10px" gap="4">
                <Icon style={{ color: colors.grey[500] }} icon="mdi:file-tree-outline" />
                <Typography style={{ marginLeft: "8px", ...nonSelectableTextStyle }} variant="h5">
                  Building Element Groups
                </Typography>
              </Box>
              <Typography
                style={{ marginLeft: "8px", ...nonSelectableTextStyle }}
                marginRight="16px"
                marginTop="12px"
                variant="body2"
              >
                Building elements grouped by Assembly type. Double click to select. You can turn visibility on and off
                whilst using assembly groupings.
              </Typography>
              <Box
                component="div"
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  // Ensure padding at the bottom for better UX when scrolling
                  paddingBottom: "50px",
                }}
              >
              <AssemblyBrowserPanel />
              </Box>
            </Box> */}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Box
              component="div"
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "calc(100vh - 100px)", // Adjust for the marginTop
                marginTop: "20px",
                overflow: "hidden",
                gap: 2,
                position: "relative", // For absolute positioning of children if needed
              }}
            >
              <Box component="div" flexDirection="row" display="flex" marginLeft="10px" gap="4">
                <Icon style={{ color: colors.grey[500] }} icon="mdi:file-tree-outline" />
                <Typography style={{ marginLeft: "8px", ...nonSelectableTextStyle }} variant="h5">
                  Material Grouping
                </Typography>
              </Box>
              <Typography
                style={{ marginLeft: "8px", ...nonSelectableTextStyle }}
                marginRight="16px"
                marginTop="12px"
                variant="body2"
              >
                Building elements grouped by Material type. Double click to select. You can turn visibility on and off
                whilst using assembly groupings.
              </Typography>
              {/* Scrollable container for children */}
              <Box
                component="div"
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  // Ensure padding at the bottom for better UX when scrolling
                  paddingBottom: "50px",
                }}
              >
                {/* Children components go here */}
                <MaterialBrowserPanel name="Material Tree" />
              </Box>
            </Box>
          </CustomTabPanel>

          
        </Box>
      </Box>
    </>
  );
};





// <CustomTabPanel value={value} index={0}>
//             <Box
//               component="div"
//               flexDirection="column"
//               display="flex"
//               width="100%"
//               marginTop="20px"
//               marginLeft="5px"
//               gap="2"
//             >
//               <Box component="div" flexDirection="row" display="flex" marginLeft="10px" gap="4">
//                 <Icon style={{ color: colors.grey[500] }} icon="mdi:file-tree-outline" />
//                 <Typography variant="h5" style={{ marginLeft: "8px", ...nonSelectableTextStyle }}>
//                   Work Station Overview
//                 </Typography>
//               </Box>
//               <Typography
//                 style={{ marginLeft: "8px", ...nonSelectableTextStyle }}
//                 marginRight="16px"
//                 marginTop="8px"
//                 variant="body2"
//               >
//                 Building elements grouped by work station and building step. Double click to select.
//               </Typography>
//               {/* // Use the navigation arrows to move through them. */}
//               <StationBrowserPanel />
//             </Box>
//           </CustomTabPanel>

export default ProjectOverviewPanel;
