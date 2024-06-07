import { useTheme } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

const testData = [
    {
      "id": "javascript",
      "label": "javascript",
      "value": 478,
    },
    {
      "id": "php",
      "label": "php",
      "value": 546,
    },
    {
      "id": "rust",
      "label": "rust",
      "value": 55,
    },
    {
      "id": "scala",
      "label": "scala",
      "value": 14,
    },
    {
      "id": "java",
      "label": "java",
      "value": 346,
    }
  ]
  const MyResponsivePie = ({ data /* see data tab */ , keys}) => {

    if(data !== undefined)
        {return (
        <ResponsivePie
                data={data}
                margin={{ top: 20   , right: 10, bottom: 20, left: 30 }}
                valueFormat=" >-"
                innerRadius={0.5}
                padAngle={2}
                cornerRadius={1}
                activeInnerRadiusOffset={3}
                activeOuterRadiusOffset={15}
                colors={{ scheme: 'blue_green' }}
                borderColor={{ theme: 'background' }}
                enableArcLinkLabels={false}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                // arcLabelsTextColor={{
                //     from: 'color',
                //     modifiers: [
                //         [
                //             'darker',
                //             2
                //         ]
                //     ]
                // }}
                legends={[]}
            /> 
        )}
        return(<>
        </>)
        }

export default MyResponsivePie;

