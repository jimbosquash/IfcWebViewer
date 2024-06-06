// import Header from "../../components/Header";
import { tokens } from "../../theme";
import { Box, Typography, useTheme } from "@mui/material";
// import Bar from "../../components/BarChart";
import "./dashBoardStyles.css"
import {useState, useEffect} from "react";
// import MyResponsivePie from "../../components/pie";
import SummaryRow from "./summaryRow";
import {buildingElement} from "../../utilities/IfcUtilities"
import {getStationBarChartArray} from "../../utilities/dataUtilities"
import React from "react";
import BarChart from "../../components/BarChart";

interface DashboardProps {
    loadedBuildingElements: buildingElement[];
}

export const DashBoard: React.FC<DashboardProps> = ({loadedBuildingElements}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [barChartData,setBarChartData] = useState<any[]>([]);
    const [buildingElements,setBuildingElements] = useState<buildingElement[]>([]);

    useEffect(() => {
        console.log('Dashboard input before set', loadedBuildingElements)
        setBuildingElements(loadedBuildingElements);
    },[loadedBuildingElements])


    useEffect(() => {
        // create bar chart data
        const data = getStationBarChartArray(buildingElements);
        console.log('Dashboard BuildingElements set', data)

        setBarChartData(data);
    },[buildingElements])

    const boxStyle = { 
        backgroundColor: colors.primary[400],
        borderRadius: 4,
        justifyContent:"center",
    }

  return<>
    <Box component={"div"}         
        m="20px">
        <Box
            component={"div"}
            m="20px"
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
            >
            {/* <Header title="Module Data Assistant" subtitle="Display ifc data in meaningful ways" /> */}
            {/* <Box component={"div"}>
                <UploadCsvButton onFileLoad={handleFileLoad}/>
            </Box> */}
        </Box>

        {/* {Grid} */}

        <Box 
        component={"div"}
         className="scrollable-container"
            display='grid'
            height={"100%"}

            gridTemplateColumns={"repeat(12,1fr)"}
            gridAutoRows='140px'
            padding='20px'
            gap='20px'>
        <SummaryRow loadedbuildingElements={buildingElements}/>
            {/* //Row 2 */}
            <Box
                component={"div"}
                gridColumn="span 9"
                gridRow="span 3"
                style={boxStyle}                
                >
                <Box
                component={"div"}
                mt="25px"
                p="0 30px"
                display="flex"
                justifyContent="space-between"
                alignItems="center">
                    <Box  component={"div"}>
                        <Typography variant="h6" fontWeight={"600"} color={colors.grey[100]}>
                            {buildingElements?.length.toString() ?? 'no elements selected'}
                        </Typography>
                    </Box>
                </Box>
                <Box component={"div"} ml="10px" mb="-70px" width={"90%"} height={"90%"}>
                    {/* <Bar data={barChartData} keys={["CE", "UN", "EP", "Other"]} isDashboard={true}/> */}
                    <BarChart data={barChartData} keys={["CE", "UN", "EP", "Other"]} isDashboard={true} />
                </Box>
            </Box>

            <Box
            style={boxStyle}
            component={"div"}
            gridColumn="span 3"
            gridRow="span 3"
            >
                <Box
                component={"div"}
                mt="25px"
                p="0 30px"
                display="flex"
                justifyContent="space-between"
                alignItems="center">
                    <Box  component={"div"}>
                        <Typography variant="h6" fontWeight={"600"} color={colors.grey[100]}>
                            Building Elements
                        </Typography>
                    </Box>
                </Box>
                <Box  component={"div"} ml="10px" mb="-70px" width={"90%"} height={"90%"}>
                    {/* <MyResponsivePie/> */}
                </Box>
            </Box>
        </Box>
    </Box>
  </>
}

export default DashBoard;

