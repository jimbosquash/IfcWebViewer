import { FragmentStreamLoader } from "openbim-components";
import FloatingButtonGroup from "../viewer/floatingButtonGroup";
import DraggablePanel from "./draggablePanel";
import * as FRAGS from "@thatopen/fragments"
import * as OBC from "@thatopen/components"
import { useEffect, useState } from "react";
import { buildingElement, GetBuildingElements } from "../../utilities/IfcUtilities";
import TaskOverViewPanel from "./taskOverviewPanel";

interface OverlayProps {
    ifcModel : FRAGS.FragmentsGroup
    components : OBC.Components
    buildingElements : buildingElement[];
}

const Overlay: React.FC<OverlayProps> = ({ifcModel, components, buildingElements}) => {
    // here we take in the frag mesh and display relevant over all data aswell as state of whats visiable/ active/ so on

    const [data, setData] = useState<any>([]);
    useEffect(() => {

        if(buildingElements)
        {
            //to do start to process them into groups for task board
        }        
    },[ifcModel,components,buildingElements])

    return (
        <>
            <FloatingButtonGroup ifcModel={ifcModel} buildingElements={buildingElements}/>
        </>
    )

}
export default Overlay;