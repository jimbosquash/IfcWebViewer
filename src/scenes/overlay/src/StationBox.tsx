import { Box, Typography, IconButton, useTheme } from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { tokens } from "../../../theme";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BuildingStepBox from "./BuildingStepBox";
import { buildingElement, groupElements, SelectionGroup } from "../../../utilities/BuildingElementUtilities";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { ComponentsContext } from "../../../context/ComponentsContext";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { VisibilityState } from "../../../utilities/types";

interface GroupBoxProps {
  groupName: string;
  elements: buildingElement[];
  child: GroupBoxProps;
}

const StationBox: React.FC<GroupBoxProps> = ({ groupName, elements }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useContext(ComponentsContext);
  const [buildingSteps, setBuildingSteps] = useState<Map<string, buildingElement[]>>();
  const [hasChildren, setHasChildren] = useState<boolean>(false)
  const [childVisible, setChildVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [modelViewManager, setModelViewManager] = useState<ModelViewManager | undefined>();
  const [isVisible, setIsVisible] = useState(modelViewManager?.GroupVisibility?.get(groupName) || false);

  useEffect(() => {
    if (!components) return;
    const viewManager = components.get(ModelViewManager);
    // console.log(
    //   "stationBox: component changed, setting view manager, vis state",
    //   stationName,
    //   modelViewManager?.GroupVisibility?.get(stationName)
    // );
    viewManager.onGroupVisibilitySet.add((data) => handleVisibilityyUpdate(data));
    viewManager.onSelectedGroupChanged.add((data) => handleSelectedGroupChanged(data));
    setModelViewManager(viewManager);
    setIsVisible(modelViewManager?.GroupVisibility?.get(groupName) || true);

    return () => {
      viewManager.onGroupVisibilitySet.remove((data) => handleVisibilityyUpdate(data));
      viewManager.onSelectedGroupChanged.remove((data) => handleSelectedGroupChanged(data));
    };
  }, [components]);

  useEffect(() => {
    if (!modelViewManager?.Groups) return;
    const steps = groupElements(elements, "BuildingStep");
    console.log("stationbox: getting children", steps)
    if (steps.size > 0) 
      {
        setBuildingSteps(steps);
        setHasChildren(true);
      }
    else
      setHasChildren(false)
  }, [modelViewManager?.Groups, elements]);

  const toggleChildVisibility = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setChildVisible((prev) => !prev);
    },
    [modelViewManager, groupName]
  );

  const handleSelectedGroupChanged = (data: SelectionGroup) => {
    setIsSelected(groupName === data.groupName);
  };

  const handleVisibilityyUpdate = (data: Map<String, VisibilityState>) => {
    const visibilityState = data.get(groupName);
    if (visibilityState === undefined) return;

    // console.log("stationbox: handling visibility update:", data, visibilityState);
    setIsVisible(visibilityState);
  };

  const ToggleVisibility = useCallback(() => {
    if (modelViewManager?.GroupVisibility) {
      const newVisGroups = new Map(modelViewManager.GroupVisibility);
      const vis = newVisGroups.get(groupName);
      const newVisState = vis === "Hidden" ? "Visible" : "Hidden";
      newVisGroups.set(groupName, newVisState);
      modelViewManager.GroupVisibility = newVisGroups;
      setIsVisible(!vis);
    }
  }, [modelViewManager, groupName]);

  const setSelected = () => {
    if (modelViewManager) {
      modelViewManager.SelectedGroup = {
        groupType: "Station",
        groupName: groupName,
        elements: elements,
      };
      setIsSelected(true);
      if (!modelViewManager.GroupVisibility?.get(groupName)) {
        ToggleVisibility();
      }

      //todo highlight and zoom to selected
    }
  };

  const displayName = groupName.startsWith("Prefab -") ? groupName.slice("Prefab -".length) : groupName;

  const handelDoubleClick = () => {
    setSelected();
    if(hasChildren)
      setChildVisible((prev) => !prev);
    
  }

  const nonSelectableTextStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none', // For Safari
    MozUserSelect: 'none', // For Firefox
    msUserSelect: 'none', // For Internet Explorer/Edge
  };

  return (
    <Box component="div">
      <Box
        component="div"
        onDoubleClick={() => handelDoubleClick()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          padding: isHovered ? "8px" : "10px",
          width: isHovered ? "255px" : "250px",
          height: "35px",
          margin: "8px 0",
          borderRadius: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          border: isSelected ? "1px solid #ccc" : "none",
          backgroundColor: isHovered ? colors.primary[400] : colors.grey[900],
          transition: "all 0.3s ease",
          justifyContent: "space-between",
        }}
      >
        <Typography noWrap  maxWidth="105px" variant={isSelected ? "h5" : "h6" } sx={{ flexGrow: 1 ,...nonSelectableTextStyle}}>
          {displayName}
        </Typography>
        <Typography color={colors.primary[300]} noWrap variant="body2" sx={{ marginLeft: "10px" , ...nonSelectableTextStyle}}>
          el : {elements.length}
        </Typography>
        <IconButton
          size="small"
          sx={{ marginLeft: "8px", color: colors.grey[500] }}
          onClick={(e) => {
            e.stopPropagation();
            ToggleVisibility();
            // console.log("click handle vis toggle",modelViewManager)
          }}
        >
          {isVisible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
        </IconButton>
        {hasChildren && (
          <IconButton size="small" sx={{ marginLeft: "4px", color: colors.grey[500] }} onClick={toggleChildVisibility}>
            {childVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>
      {childVisible && buildingSteps && (
        <Box component="div" sx={{ marginLeft: "5px", marginTop: "10px" }}>
          {Array.from(buildingSteps).map(([buildingStep, stepElements]) => (
            <BuildingStepBox key={buildingStep} child={undefined} groupType={"BuildingStep"} groupName={buildingStep} elements={stepElements} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default StationBox;
