import { Box, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react"
import StatBoxWithPieChart from "../../components/statBoxPieWithChart";
import { tokens } from "../../theme";
import { buildingElement } from "../../utilities/IfcUtilities";
import Timer from "@mui/icons-material/Timer";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import { convertToPieChartValue, groupByProperty, getTotalValue } from "../../utilities/dataUtilities";


interface summaryRowProps {
    newBuildingElements: buildingElement[];
}

export const ProductionSummaryRow = ({newBuildingElements}: summaryRowProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [buildingElements,setBuildingElements] = useState<buildingElement[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [totalLabourTime, setTotalLabourTime] = useState<number>(0);
    const [totalLabourPrice, setTotalLabourPrice] = useState<number>(0);
    const [totalMaterialPrice, setTotalMaterialPrice] = useState<number>(0);
    const [materialTypeData, setMaterialTypeData] = useState<any>();

    useEffect(() => {
        if(newBuildingElements)
            setBuildingElements(newBuildingElements);
    },[newBuildingElements])

    useEffect(() => {
        //get total price
        //get labor grouped by material
        //get labour price by material
        // get total material
        const elem = groupByProperty(buildingElements,"Materiaal");
        const chartData = convertToPieChartValue(elem);
        console.log("pie data", chartData)
        setMaterialTypeData(chartData);

        setTotalPrice(getTotalValue('TotalPrice',buildingElements));
        setTotalLabourTime(getTotalValue('LabourTime',buildingElements));
        setTotalLabourPrice(getTotalValue('LabourPrice',buildingElements));
        setTotalMaterialPrice(getTotalValue('MaterialPrice',buildingElements));

        console.log('mat group', chartData);



    },[buildingElements])

    const boxStyle = { 
        backgroundColor: colors.primary[400],
        borderRadius: 4,
        display: "flex",
        alignContent: "center",
        justifyContent:"center",
    }

    
      
      function formatPrice(price: number): string {

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
          }).format(price);
      }

      function formathours(minutes: number) : string {
        let roundedMinutes = parseFloat(minutes.toFixed(0));
        let hours = Math.floor(roundedMinutes / 60);
        let remainingMinutes = roundedMinutes % 60;
        return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes} hours`;
    }

    return (<>
     <Box
            component={'section'}
            gridColumn={'span 2'}
            style={boxStyle}
            >
                <StatBoxWithPieChart
                title={totalPrice === 0 ? "Price data not found" : formatPrice(totalPrice)}
                subtitle={"Total Price"}
                data={undefined}
                icon={
                    <AttachMoneyOutlined
                        sx={{ color:colors.greenAccent[500],fontSize: "26px"}}
                    />
                }
                />

            </Box>
            <Box
            component={'section'}
            gridColumn={'span 3'}
            style={boxStyle}
            >
                <StatBoxWithPieChart
                title={totalMaterialPrice === 0 ? "Price data not found" : formatPrice(totalMaterialPrice)}
                subtitle="Total material price"
                data={materialTypeData}
                icon={
                    <AttachMoneyOutlined
                        sx={{ color:colors.greenAccent[500],fontSize: "26px"}}
                    />
                }
                />
            </Box>

            <Box
            component={'section'}
            gridColumn={'span 3'}
            style={boxStyle}
            >
                <StatBoxWithPieChart
                title={totalLabourTime === 0 ? "Time data not found" : formathours(totalLabourTime)}
                subtitle="Labour time by material"
                data={undefined}
                icon={
                    <Timer
                        sx={{ color:colors.greenAccent[500],fontSize: "26px"}}
                    />
                }
                />
            </Box>

            <Box
            component={'section'}
            gridColumn={'span 3'}
            style={boxStyle}
            >
                <StatBoxWithPieChart
                title={totalLabourPrice === 0 ? "Price data not found" : formatPrice(totalLabourPrice)}
                subtitle="Labour price by material"
                data={undefined}
                icon={
                    <AttachMoneyOutlined
                        sx={{ color:colors.greenAccent[500],fontSize: "26px"}}
                    />
                }
                />
            </Box>
            
    </>)
}

