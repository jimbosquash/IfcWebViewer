import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { buildingElement, GroupingType, SelectionGroup } from "../../../utilities/BuildingElementUtilities";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { useState, useEffect, useContext, useCallback } from "react";
import { ComponentsContext } from "../../../context/ComponentsContext";
import { VisibilityState } from "../../../utilities/types";

interface GroupBoxProps {
  groupName: string;
  elements: buildingElement[];
  child: GroupBoxProps | undefined;
  groupType: GroupingType;
}

export const BuildingStepBox = (props: GroupBoxProps) => {
  const { groupName, elements, groupType } = props;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [modelViewManager, setModelViewManager] = useState<ModelViewManager | undefined>();
  const [visibilitySate, setVisibilityState] = useState(modelViewManager?.GroupVisibility?.get(groupName));
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const components = useContext(ComponentsContext);

  useEffect(() => {
    if (!components) return;
    const viewManager = components.get(ModelViewManager);

    viewManager.onGroupVisibilitySet.add((data) => handleVisibilityyUpdate(data));
    viewManager.onSelectedGroupChanged.add((data) => handleSelectedGroupChanged(data));
    setModelViewManager(viewManager);
    setVisibilityState(modelViewManager?.GroupVisibility?.get(groupName));

    return () => {
      viewManager.onGroupVisibilitySet.remove((data) => handleVisibilityyUpdate(data));
      viewManager.onSelectedGroupChanged.remove((data) => handleSelectedGroupChanged(data));
    };
  }, [components]);

  const handleVisibilityyUpdate = (data: Map<String, VisibilityState>) => {
    const visibilityState = data.get(groupName);
    if (visibilityState === undefined) return;

    setVisibilityState(visibilityState);
  };

  const handleSelectedGroupChanged = (data: SelectionGroup) => {
    setIsSelected(groupName === data.groupName);
  };

  const setSelected = () => {
    if (modelViewManager) {
      modelViewManager.SelectedGroup = {
        groupType: groupType,
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

  const ToggleVisibility = useCallback(() => {
    if (modelViewManager?.GroupVisibility) {
      const newVisGroups = new Map(modelViewManager.GroupVisibility);
      const vis = newVisGroups.get(groupName);
      const newVisState = vis === "Hidden" ? "Visible" : "Hidden";
      newVisGroups.set(groupName, newVisState );
      modelViewManager.GroupVisibility = newVisGroups;
      setVisibilityState( newVisState);
    }
  }, [modelViewManager, groupName]);

  const nonSelectableTextStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none', // For Safari
    MozUserSelect: 'none', // For Firefox
    msUserSelect: 'none', // For Internet Explorer/Edge
  };

  return (
    <>
      <Box key={groupName} component="div" style={{ marginBottom: "2px" }}>
        <Box
          component="div"
          onDoubleClick={() => setSelected()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          width="100%"
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
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography noWrap maxWidth={"150px"} variant="h6" sx={{ flexGrow: 1 , ...nonSelectableTextStyle}}>{`Step: ${groupName}`}</Typography>
          <Typography color={colors.grey[500]} noWrap variant="body2" sx={{ marginLeft: "20px", ...nonSelectableTextStyle}}>
            el : {elements.length}
          </Typography>
          <IconButton
            size="small"
            sx={{ marginLeft: "8px", color: colors.grey[700] }}
            onClick={(e) => {
              e.stopPropagation();
              ToggleVisibility();
            }}
          >
            {visibilitySate ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default BuildingStepBox;
