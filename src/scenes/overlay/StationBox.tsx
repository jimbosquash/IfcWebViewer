import { Box, Typography, IconButton, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { tokens } from "../../theme";
import {
  buildingElement,
  groupElements,
} from "../../utilities/BuildingElementUtilities";
import TocIcon from "@mui/icons-material/Toc";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BuildingStepBox from "./BuildingStepBox";
import { ModelStateContext } from "../../context/ModelStateContext";

interface StationBoxProps {
  stationName: string;
  elements: buildingElement[];
}

const StationBox = (props: StationBoxProps) => {
  const { stationName, elements } = props;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const modelState = useContext(ModelStateContext);
  const [buildingSteps, setBuildingSteps] = useState<Map<string, buildingElement[]>>();
  const [childVisible, setChildVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!modelState?.groups) return;
    const steps = groupElements(elements, "BuildingStep");
    if (steps) setBuildingSteps(groupElements(elements, "BuildingStep"));
  }, [modelState?.groups]);


  return (
    <>
      <Box component="div">
        <Box
          component="div"
          onClick={() => {
            console.log("clicked station", stationName);
            if (modelState) {
              modelState.setSelectedGroup({
                groupType: "Station",
                groupName: stationName,
                elements: elements,
              });
            }
          }}
          width="100%"
          style={{
            // border: '1px solid #ccc',
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            padding: "10px",
            width: "250px",
            height: "35px",
            margin: "10px 0",
            borderRadius: "12px",
            cursor: "pointer",
          }}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            noWrap
            maxWidth={"105px"}
            variant="h6"
            sx={{ flexGrow: 1 }}
          >
            {stationName.startsWith("Prefab -")
              ? stationName.slice("Prefab -".length)
              : stationName}
          </Typography>

          <Typography
            color={colors.primary[300]}
            noWrap
            variant="body2"
            sx={{ marginLeft: "10px" }}
          >
            el : {elements.length}
          </Typography>

          <IconButton
            size="small"
            sx={{ marginLeft: "8px", color: colors.grey[500] }}
            onClick={(e) => {
              // update visibility group in ModelContext
              e.stopPropagation();
              const visgroups = modelState?.groupVisibility;
              if (visgroups) {
                const newVisGroups = new Map(visgroups);
                const vis = newVisGroups.get(stationName);
                console.log("get vis for ", vis, visgroups);
                newVisGroups.set(stationName, !vis);
                modelState.setGroupVisibility(newVisGroups);
              }
            }}
          >
            {modelState?.groupVisibility.get(stationName) ? (
              <VisibilityOutlinedIcon />
            ) : (
              <VisibilityOffOutlinedIcon />
            )}
          </IconButton>

          <IconButton
            size="small"
            sx={{ marginLeft: "4px", color: colors.grey[500] }}
            onClick={(e) => {
              e.stopPropagation();
              setChildVisible(!childVisible);
            }}
          >
            {modelState?.groupVisibility.get(stationName) ? (
              <TocIcon />
            ) : (
              <TocIcon />
            )}
          </IconButton>
        </Box>

        {/* // child elements fold down here */}
        {childVisible && (
          <Box component="div" style={{ marginLeft: "5px", marginTop: "10px" }}>
            {buildingSteps &&
              Array.from(buildingSteps).map(([buildingStep, elements]) => (
                <BuildingStepBox
                  buildingStep={buildingStep}
                  elements={elements}
                />
              ))}
          </Box>
        )}
      </Box>
    </>
  );
};

export default StationBox;
