import { Box, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { tokens } from "../theme.js";
import Pie from "./pie.jsx";

interface StatBoxPieChartProps {
    title: string;
    subtitle: string;
    icon: any;
    data: {id: string, label: string, value: number}[] | undefined; // to go in pie chart
}

const StatBoxWithPieChart = ({ title, subtitle, icon, data  }: StatBoxPieChartProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [keys,setKeys] = useState<string[]>([]);

  useEffect(() => {
    if(data)
    {
      const ids = data.map((entry) => entry.id);
      setKeys(ids);
    }
  },[data])

  return (
<Box component={'div'} width="100%" m="0 30px" display="flex" flexDirection={'row'}>
  <Box component={'div'} style={{ flex: '1' }} display="flex" flexDirection={'column'} justifyContent='flex-start'>
    <Box component={'div'} mt="20px">
      {icon}
      <Typography
        variant="h6"
        fontWeight='bold'
        sx={{ color: colors.grey[100] }}>
        {title}
      </Typography>
    </Box>
    <Box component={'div'} display="flex" justifyContent='space-between' mt="2px">
      <Typography
        variant="h6"
        fontWeight='italic'
        sx={{ color: colors.greenAccent[500] }}>
        {subtitle}
      </Typography>
    </Box>
  </Box>
  <Box border="thick" style={{ flex: '1', backgroundColor: '' }} display="flex" alignItems="center" justifyContent='center' component={'div'}>
    <Pie data={data} keys={keys} />
  </Box>
</Box>
  );
};

export default StatBoxWithPieChart;

