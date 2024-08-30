import { Icon } from "@iconify/react";
import { Box, Button, ButtonGroup, Tabs, Tooltip, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { ModelCache } from "../../../../bim-components/modelCache";
import CustomTabPanel from "../../../../components/CustomTabPanel";
import StyledTab from "../../../../components/StyledTab";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { nonSelectableTextStyle } from "../../../../styles";
import { tokens } from "../../../../theme";
import { BuildingElement } from "../../../../utilities/types";
import AssemblyBrowser from "./AssemblyBrowser";
import MaterialOverviewPanel from "./MaterialOverViewPanel";

export const ProjectOverviewPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [value, setValue] = useState(0);
  const components = useComponentsContext();

  useEffect(() => {
    if(!components) return;
    components.get(ModelCache).onBuildingElementsChanged.add((data) => getPropertyTree(data))
  
    return () => {
        components.get(ModelCache).onBuildingElementsChanged.remove((data) => getPropertyTree(data))
    }
  }, [components])
  


  // a functino that will create a tree for material, then give it to cache and set it here for child 

  const getPropertyTree = (buildingElements: BuildingElement[]) => {
    if(!buildingElements) return;

  }

  return (
    <>
      <Box
        component="div"
        style={{
          height: "100%",
          width: "100%",
          padding: "0px",
          boxSizing: "border-box",
        }}
      >
        <Box component={"div"} sx={{ borderBottom: 1, width: "100%", borderColor: "divider", marginLeft: "0px" }}>
          <Tabs value={value} onChange={(event: React.SyntheticEvent, newValue: number) => setValue(newValue)}>
            <StyledTab label="Assembly" index={0} />
            <StyledTab label="Material" index={1} />
          </Tabs>
        </Box>
        <Box component={"div"} height="100%">
          <CustomTabPanel value={value} index={0}>
            <Box
              component="div"
              flexDirection="column"
              display="flex"
              width="100%"
              marginTop="20px"
              marginLeft="5px"
              gap="2"
            >
              <Box component="div" flexDirection="row" display="flex" marginLeft="10px" gap="4">
                <Icon style={{ color: colors.grey[500] }} icon="mdi:file-tree-outline" />
                <Typography variant="h5" style={{ marginLeft: "8px", ...nonSelectableTextStyle }}>
                  Project Overview
                </Typography>
              </Box>
              <Typography style={{ marginLeft: "8px", ...nonSelectableTextStyle }} marginRight="16px" marginTop="8px" variant="body2">
                Building elements grouped by work station and building step. Double click to select.
              </Typography>
              {/* // Use the navigation arrows to move through them. */}
              <AssemblyBrowser />
            </Box>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            <Box
              component="div"
              flexDirection="column"
              display="flex"
              width="100%"
              marginTop="20px"
              marginLeft="5px"
              gap="2"
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
              <ButtonGroup style={{ marginTop: "18px", marginBottom: "10px", alignSelf: "center" }}>
                <Tooltip title="clear visibility">
                  <Button variant="contained">
                    <Icon style={{ color: colors.grey[600] }} icon="ic:outline-layers-clear" />
                  </Button>
                </Tooltip>

                <Tooltip title="toggle visibility">
                  <Button variant="contained">
                    <Icon style={{ color: colors.grey[600] }} icon="mdi:eye" />
                  </Button>
                </Tooltip>

                <Tooltip title="change colors">
                  <Button variant="contained">
                    <Icon style={{ color: colors.grey[600] }} icon="carbon:change-catalog" />
                  </Button>
                </Tooltip>
              </ButtonGroup>
              <MaterialOverviewPanel />
            </Box>
          </CustomTabPanel>
        </Box>
      </Box>
    </>
  );
};

export default ProjectOverviewPanel;
