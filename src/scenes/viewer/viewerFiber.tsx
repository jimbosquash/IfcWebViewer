import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoViewport,GizmoViewcube , GizmoHelper } from '@react-three/drei'
import '../../styles.css'
import {useEffect, useState} from 'react'
import LoadModel from '../../utilities/modelLoader';
import * as FRAGS from "bim-fragment";
import { buildingElement, GetBuildingElements } from '../../utilities/IfcUtilities';
// import DraggableDataGrid from '../../components/draggabeDataGrid';
// import DraggablePanel from '../../components/draggablePanel';
import { tokens } from '../../theme';
import { Button, ButtonGroup, useTheme } from '@mui/material';
import * as OBC from "openbim-components";

// import FloatingButtonGroup from './floatingButtonGroup';

interface ViewerProps {
    ifcModel: FRAGS.FragmentsGroup;
    components: OBC.Components
}

export const ViewerFiber: React.FC<ViewerProps> = ({ifcModel, components}) => {
    // const containerRef = useRef(null);                               //only need this if passing it into the ifc creation object
    const [fragGroup,setFragGroup] = useState<FRAGS.FragmentsGroup | undefined>();
    const [loading, setLoading] = useState(false);
    const [buildingElements, setBuildingElements] = useState<buildingElement[]>([]);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    useEffect(() => {
        const fetchBuildingElements = async () => {

            console.log("fetching building elements",ifcModel)
            if(ifcModel) {
                setLoading(true)
                setFragGroup(ifcModel);
                try{
                    const newBuildingElements = await GetBuildingElements(ifcModel,components);
                    setBuildingElements(newBuildingElements);
                 } catch (error) {
                    console.error("Error fetching building elements",error)
                } finally {
                    setLoading(false)
                }
            }
        };

        fetchBuildingElements();
    },[ifcModel,components]);

    useEffect(() => {
        console.log("elements changed, grouping starting")

        //set data for table
    }, [buildingElements])

    if(loading) return <div>Loading...</div>;
//dampingFactor={0.08} rotateSpeed={0.3} zoomSpeed={0.9} panSpeed={0.4}
    return (
        <>
        {/* <DraggablePanel>
            <DraggableDataGrid data={buildingElements}/>
        </DraggablePanel> */}
        {/* <FloatingButtonGroup/> */}
        <Canvas
        // ref={containerRef}
        shadows
        camera={ {
            fov: 45,
            near: 0.1,
            far: 200,
            position: [ - 4, 3, 6 ]
        } }>
            <GizmoHelper alignment="top-right" margin={[80, 50]}>
                <GizmoViewcube color={colors.primary[400]} textColor={colors.grey[100]} strokeColor={colors.grey[100]}/>
            </GizmoHelper>            
            <OrbitControls makeDefault dampingFactor={0.08}/>
            <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
            <ambientLight intensity={ 3.5 } />
            <LoadModel ifcModel={fragGroup}></LoadModel>
            {/* <HandleIFC containerRef={containerRef} path={"../resources/small.frag"} propertiesPath={"../resources/small.json"} name={"TestFrag"} /> */}
            <Grid 
            infiniteGrid={true}
            cellColor={colors.primary[400]}
            sectionColor={colors.primary[400]}
            fadeDistance={25}
            fadeStrength={1}/>
    </Canvas>
    </>
      );
}

export default ViewerFiber;