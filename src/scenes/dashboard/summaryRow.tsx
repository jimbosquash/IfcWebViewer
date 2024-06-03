import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useState } from "react";
import { tokens } from "../../theme";
import StatBox from "../../components/statBox.jsx";
import EmailIcon from "@mui/icons-material/Email";
import Construction from "@mui/icons-material/Construction";
import ListAlt from "@mui/icons-material/ListAlt";
import Timer from "@mui/icons-material/Timer";
import { useEffect } from "react";
import * as FRAGS from "@thatopen/fragments";
import { buildingElement, GetBuildingElements, getUniqueElementCount } from "../../utilities/IfcUtilities";
import * as OBC from "@thatopen/components";
import { Email } from "@mui/icons-material";




interface DashboardProps {
    data: FRAGS.FragmentsGroup | undefined;
    components: OBC.Components | undefined;
}


export const SummaryRow:React.FC<DashboardProps> = ({data, components}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [buildingElements,setBuildingElements] = useState<buildingElement[]>([]);
    const [totalCount, setTotalCount] = useState<number>()
    const [uniqueProductCodes, setUnqiueProductCodeCount] = useState<number>()

    const boxStyle = { 
        backgroundColor: colors.primary[400],
        borderRadius: 4,
        display: "flex",
        alignContent: "center",
        justifyContent:"center",
        // height: "120px"
    }


    useEffect(() => {
        async function asyncGetElements() {
            if(!data || !components)
                return;
            var newBuildingElements = await GetBuildingElements(data, components)
            setBuildingElements(newBuildingElements);
        }

        if(components && data)
            asyncGetElements();  

        },[data] )

        useEffect(() =>{
            if(!buildingElements)
                return; 
            console.log('setting summary data')
            setTotalCount(buildingElements.length);
            setUnqiueProductCodeCount(getUniqueElementCount(buildingElements))
        }, [buildingElements])




    return <>
     <Box
            component={'section'}
            gridColumn={'span 3'}
            style={boxStyle}
            >
                <StatBox
                title={totalCount}
                subtitle="Total Elements"
                progress="0.75"
                increase="+14%"
                icon={
                    <Construction
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
                <StatBox
                title={uniqueProductCodes}
                subtitle="Different Element types"
                progress="0.12"
                increase="+54%"
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
                <StatBox
                title="1,432"
                subtitle="Fasteners"
                progress="0.86"
                increase="-12%"
                icon={
                    <ListAlt
                        sx={{ color:colors.greenAccent[500],fontSize: "26px"}}
                    />
                }
                />
            </Box>
            
    </>
}

export default SummaryRow;