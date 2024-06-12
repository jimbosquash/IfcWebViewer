import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { buildingElement } from "../../utilities/BuildingElementUtilities";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

interface BuildingStepBoxProps{
    buildingStep: string;
    elements : buildingElement[];
    setSelectedElements: (elements: buildingElement[]) => void;
    toggleElementVisibility: (groupType: string, buildingStep: string) => void;
    getVisibility: (groupName: string) => boolean;
  }
  
  export const BuildingStepBox = (props : BuildingStepBoxProps) => {
    const {buildingStep,elements, setSelectedElements, toggleElementVisibility, getVisibility} = props;
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    return(<>
    <Box key={buildingStep} component="div" style={{ marginBottom: '2px' }}>
                  <Box component="div" 
                  onClick={() => { 
                    console.log('clicked building step', buildingStep)
                    setSelectedElements(elements)}}
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
                    toggleElementVisibility('BuildingStep',buildingStep)}}>
                    {getVisibility(buildingStep) ? <VisibilityOffOutlinedIcon/> : <VisibilityOutlinedIcon/>} 
                  </IconButton>
                  </Box>
                </Box>
    </>)
  
  }

  export default BuildingStepBox;
  