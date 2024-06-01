import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";

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

export default TaskBox;