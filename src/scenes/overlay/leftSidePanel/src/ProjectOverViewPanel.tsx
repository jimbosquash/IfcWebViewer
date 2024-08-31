import { Icon } from "@iconify/react";
import { Box, Button, ButtonGroup, Tabs, Tooltip, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { ModelCache } from "../../../../bim-components/modelCache";
import CustomTabPanel from "../../../../components/CustomTabPanel";
import StyledTab from "../../../../components/StyledTab";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { nonSelectableTextStyle } from "../../../../styles";
import { tokens } from "../../../../theme";
import { setUpTreeFromProperties } from "../../../../utilities/BuildingElementUtilities";
import { Tree } from "../../../../utilities/Tree";
import { BuildingElement, knownProperties } from "../../../../utilities/types";
import AssemblyBrowser from "./AssemblyBrowser";
import MaterialOverviewPanel from "./MaterialOverViewPanel";

export const ProjectOverviewPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [value, setValue] = useState(0);
  const components = useComponentsContext();
  const [tree,setTree] = useState<Tree<BuildingElement>>();

  
  useEffect(() => {
    if(!components) return;
    components.get(ModelCache).onBuildingElementsChanged.add((data) => getPropertyTree(data))
    const cache = components.get(ModelCache);
    if(cache.BuildingElements) {
        getPropertyTree(cache.BuildingElements);
    }
  
    return () => {
        components.get(ModelCache).onBuildingElementsChanged.remove((data) => getPropertyTree(data))
    }
  }, [components])
  


  // a functino that will create a tree for material, then give it to cache and set it here for child 
  // HOW TO: i want to have user set vis on materials and when they select the next station that the material setting still applies.
  // it looks like I dont have to store a whole tree but i need some way of making ModelViewer show or hide
  // SOLUTION: have a collection of building elements to hide or show in viewer that panel edits.
  // QUESTION: how does this work if i have multiple layers of panels setting visibility, one will override the other
  // SOLUTION: there will only be one source that is changing this hide collection for now and it is simplest to add into update cycle
  const getPropertyTree = (buildingElements: BuildingElement[]) => {
    if(!buildingElements) return;
    // console.log("tree", tree)

    const matTree = setUpTreeFromProperties(buildingElements,[knownProperties.Material])
    console.log("tree", matTree)
    setTree(matTree);
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
              <MaterialOverviewPanel name="Material Tree" tree={tree} />
            </Box>
          </CustomTabPanel>
        </Box>
      </Box>
    </>
  );
};

export default ProjectOverviewPanel;
