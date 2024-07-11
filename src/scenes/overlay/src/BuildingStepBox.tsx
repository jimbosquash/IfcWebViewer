import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { buildingElement } from "../../../utilities/BuildingElementUtilities";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useModelContext } from "../../../context/ModelStateContext";

interface BuildingStepBoxProps{
    buildingStep: string;
    elements : buildingElement[];
  }
  
  export const BuildingStepBox = (props : BuildingStepBoxProps) => {
    const {buildingStep,elements} = props;
    const modelState = useModelContext();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    return(<>
    <Box key={buildingStep} component="div" style={{ marginBottom: '2px' }}>
                  <Box component="div" 
                  onClick={() => { 
                    console.log('clicked building step', buildingStep)
                    if(modelState)
                    {
                    modelState.setSelectedGroup({groupType: "BuildingStep",groupName: buildingStep,elements: elements})
                    }
                  }}
                  width='100%' 
                  style={{
                    backgroundColor: colors.primary[400],
                    border: '1px solid #ccc',
                    padding: '5px',
                    width: "250px",
                    height: "35px",
                    margin: '5px 0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }} 
                  display="flex" 
                  alignItems="center"
                  justifyContent='space-between'>
                    <Typography noWrap
                    maxWidth={'150px'}
                      variant="h6" 
                      sx={{ flexGrow: 1 }} 
                    >{`Step: ${buildingStep}`}</Typography>
                    <Typography 
                    color={colors.primary[300]}
                      noWrap
                      variant="body2" 
                      sx={{ marginLeft: '20px' }}
                      >el : {elements.length}
                    </Typography>
                  <IconButton size="small" sx={{ marginLeft: '8px', color: colors.grey[500] }} onClick={(e) => {
                    e.stopPropagation();
                    const visgroups = modelState?.groupVisibility;
                    if (visgroups) {
                      const newVisGroups = new Map(visgroups);
                      const vis = newVisGroups.get(buildingStep);
                      newVisGroups.set(buildingStep, !vis);
                      modelState.setGroupVisibility(newVisGroups);
                    }
                  }}>
                    {modelState?.groupVisibility.get(buildingStep)? <VisibilityOutlinedIcon/> :  <VisibilityOffOutlinedIcon/>} 
                  </IconButton>
                  </Box>
                </Box>
    </>)
  
  }

  export default BuildingStepBox;
  