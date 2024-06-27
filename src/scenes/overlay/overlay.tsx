import FloatingButtonGroup from "./floatingButtonGroup";
import * as FRAGS from "@thatopen/fragments"
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"
import { useEffect, useState } from "react";

interface OverlayProps {
    ifcModel : FRAGS.FragmentsGroup | undefined;
}

const Overlay: React.FC<OverlayProps> = ({ifcModel}) => {
    // here we take in the frag mesh and display relevant over all data aswell as state of whats visiable/ active/ so on
    return (
        <>
            <FloatingButtonGroup ifcModel={ifcModel}/>
        </>
    )

}
export default Overlay;