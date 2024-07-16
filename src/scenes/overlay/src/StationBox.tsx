import { Box, Typography, IconButton, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { tokens } from "../../../theme";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BuildingStepBox from "./BuildingStepBox";
import { buildingElement, groupElements } from "../../../utilities/BuildingElementUtilities";
import { useModelContext } from "../../../context/ModelStateContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface StationBoxProps {
  stationName: string;
  elements: buildingElement[];
}

const StationBox = (props: StationBoxProps) => {
  const { stationName, elements } = props;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { groups, setSelectedGroup, selectedGroup, groupVisibility, setGroupVisibility } = useModelContext();
  const [buildingSteps, setBuildingSteps] = useState<Map<string, buildingElement[]>>();
  const [childVisible, setChildVisible] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);

  useEffect(() => {
    if (!groups) return;
    const steps = groupElements(elements, "BuildingStep");
    if (steps) setBuildingSteps(groupElements(elements, "BuildingStep"));
  }, [groups]);

  // const handleGroupVisibility = useCallback((e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   const visgroups = groupVisibility;
  //             if (visgroups) {
  //               const newVisGroups = new Map(visgroups);
  //               const vis = newVisGroups.get(stationName);
  //               console.log("get vis for ", vis, visgroups);
  //               newVisGroups.set(stationName, !vis);
  //               setGroupVisibility(newVisGroups);
  //             }
  // })

  const toggleChildVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (groupVisibility) {
      const visgroups = groupVisibility;
      const newVisGroups = new Map(visgroups);
      newVisGroups.set(stationName, !newVisGroups.get(stationName));
      setGroupVisibility(newVisGroups);
    }
    setChildVisible((prev) => !prev);
  }, []);

  const handleVisibilityToggle = () => {
    const visgroups = groupVisibility;
    if (visgroups) {
      const newVisGroups = new Map(visgroups);
      const vis = newVisGroups.get(stationName);
      console.log("get vis for ", vis, visgroups);
      newVisGroups.set(stationName, !vis);
      setGroupVisibility(newVisGroups);
    }
  };

  const handleStationClick = useCallback(() => {
    console.log("clicked station", stationName);
    setSelectedGroup({
      groupType: "Station",
      groupName: stationName,
      elements: elements,
    });
  }, [stationName, elements, setSelectedGroup]);

  useEffect(() => {
    if (isSelected) {
      handleStationClick();
      if(!groupVisibility.get(stationName))
      {
        console.log('should make visible',)
        handleVisibilityToggle();
      }
    } else {
    }
  }, [isSelected]);

  useEffect(() => {
    if (selectedGroup?.groupName === stationName) {
      if(!isSelected)
        setIsSelected(true)
        return;
    }
    if(isSelected)
      setIsSelected(false)
  }, [selectedGroup]);

  return (
    <>
      <Box component="div">
        <Box
          component="div"
          // onClick={handleStationClick}
          onDoubleClick={() => setIsSelected(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          width="100%"
          sx={{
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            padding: isHovered ? "8px" : "10px",
            width: isHovered ? "255px" : "250px",
            height: isHovered ? "35px" : "35px",
            margin: isHovered? "8px 0" : "8px 0",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            border: isSelected ? '1px solid #ccc' : '',
            backgroundColor: isHovered ? colors.primary[400] : "transparent",
            transition: "background-color 0.3s, height 0.1s, width 0.1s, margin 0.1s",
            justifyContent: "space-between",
          }}
        >
          <Typography noWrap maxWidth={"105px"} variant="h6" sx={{ flexGrow: 1 }}>
            {stationName.startsWith("Prefab -") ? stationName.slice("Prefab -".length) : stationName}
          </Typography>

          <Typography color={colors.primary[300]} noWrap variant="body2" sx={{ marginLeft: "10px" }}>
            el : {elements.length}
          </Typography>

          <IconButton
            size="small"
            sx={{ marginLeft: "8px", color: colors.grey[500] }}
            onClick={(e) => {
              e.stopPropagation();
              handleVisibilityToggle();
            }}
          >
            {groupVisibility.get(stationName) ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
          </IconButton>
          {buildingSteps && (
            <IconButton
              size="small"
              sx={{ marginLeft: "4px", color: colors.grey[500] }}
              onClick={(e) => {
                e.stopPropagation();
                setChildVisible(!childVisible);
              }}
            >
              {childVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {/* // child elements fold down here */}
        {childVisible && (
          <Box component="div" style={{ marginLeft: "5px", marginTop: "10px" }}>
            {buildingSteps &&
              Array.from(buildingSteps).map(([buildingStep, elements]) => (
                <BuildingStepBox key={buildingStep} buildingStep={buildingStep} elements={elements} />
              ))}
          </Box>
        )}
      </Box>
    </>
  );
};

export default StationBox;
