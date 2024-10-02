import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { groupByProperty, convertToPieChartValue } from '../utilities/dataUtilities';
import Timer from "@mui/icons-material/Timer";
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import { useEffect } from "react";
import { BuildingElement } from "../utilities/types";


interface GroupProps {
  buildingElements: BuildingElement[];
  title: string;
}


export const GroupSummaryBox: React.FC<GroupProps> = ({ buildingElements, title }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    // calculate material groups
    // calc total time
    // calc total millTime
    // calc total labor time
    const elem = groupByProperty(buildingElements, "Materiaal");
    const chartData = convertToPieChartValue(elem);
    console.log('mat group', chartData);



  }, [buildingElements])


  return (<>
    <Box component={'div'} width="100%" m="0 30px">
      <Box component={'div'} display={"flex"} justifyContent='space-between' >
        <Box component={'div'} mt="20px">
          {/* {icon} */}
          <Typography
            variant="h6"
            fontWeight='bold'
            sx={{ color: colors.grey[100] }}>
            {title}
          </Typography>
        </Box>
      </Box>

      <Box component={'div'} display={"flex"} flexDirection='column' justifyContent='space-between' mt="2px" >
        <Box component={'div'} padding='4px' display={"flex"} justifyContent='flex-start' mt="2px" >
          <StorageOutlinedIcon fontSize="small" color='secondary' />
          <Typography
            variant="h6"
            fontWeight='italic'
            sx={{ color: colors.greenAccent[600] }}>
            42
          </Typography>
        </Box>

        <Box component={'div'} padding='4px' display={"flex"} justifyContent='flex-start' mt="2px" >
          <Timer fontSize="small" color='secondary' />
          <Typography
            variant="h6"
            fontWeight='italic'
            sx={{ color: colors.greenAccent[600] }}>
            18 minutes
          </Typography>
        </Box>


        {/* <Typography
          variant="h9"
          fontWeight='italic'
          sx={{color: colors.greenAccent[600]}}>
            {increase}
          </Typography> */}

      </Box>
    </Box>
  </>)
};

export default GroupSummaryBox;