import FloatingButtonGroup from "./floatingButtonGroup";
import * as FRAGS from "@thatopen/fragments"
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"
import { useEffect, useState } from "react";

interface OverlayProps {
    ifcModel : FRAGS.FragmentsGroup | undefined;
    world: OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer> | undefined;
}

const Overlay: React.FC<OverlayProps> = ({ifcModel, world}) => {
    // here we take in the frag mesh and display relevant over all data aswell as state of whats visiable/ active/ so on

    // const [data, setData] = useState<any>([]);
    // useEffect(() => {

    //     if(buildingElements)
    //     {
    //         //to do start to process them into groups for task board
    //     }        
    // },[ifcModel,components,buildingElements])

    return (
        <>
            <FloatingButtonGroup ifcModel={ifcModel}/>
        </>
    )

}
export default Overlay;