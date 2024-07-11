import { Box, styled, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../theme";

interface TaskBoxProps {
    title: string;
    subtitle: string;
    icon: any;

}

const TaskBox: React.FC<TaskBoxProps> = ( {title, subtitle, icon} ) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);   
    return(
        <Box component="div" width="100%" m="0 30px">
      <Box component="div" display={"flex"} justifyContent='space-between' >
        <Box component="div" mt="20px">
          {/* {icon} */}
          <Typography
          variant="h6"
          fontWeight='bold'
          sx={{color: colors.grey[100]}}>
            {title}
          </Typography>
        </Box>
        </Box>

        <Box component="div" display={"flex"} justifyContent='space-between' mt="2px" >
        <Typography
          variant="h6"
          fontWeight='italic'
          sx={{color: colors.greenAccent[500]}}>
            {subtitle}
          </Typography>
      </Box>
    </Box>
    )
}

const TaskBox2 = styled(Box)(( colors: any ) => ({
  backgroundColor: colors.grey[100],
  border: '1px solid #ccc',
  padding: '10px',
  width: '300px',
  margin: '10px 0',
  borderRadius: '12px',
  cursor: 'pointer',
  '&:hover': {
    borderColor: colors.grey[100],
    // Or to remove the border completely on hover:
    // border: 'none',
  },
}));

export default TaskBox;