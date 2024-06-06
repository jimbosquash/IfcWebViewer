import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoViewport,GizmoViewcube , GizmoHelper, CameraControls } from '@react-three/drei'
import '../../styles.css'
import { useEffect, useRef, useState} from 'react'
import {InteractableModel, LoadModel} from '../../utilities/modelLoader';
import * as FRAGS from "@thatopen/fragments";
import { buildingElement, GetBuildingElements } from '../../utilities/IfcUtilities';
import { tokens } from '../../theme';
import { Button, ButtonGroup, useTheme } from '@mui/material';
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import FloatingButtonGroup from '../overlay/floatingButtonGroup';
import CameraControler from "./cameraControler"
import Overlay from '../overlay/overlay';

//todo
// 1. display element table
// 2. display all tasks
// 1. get fragment hit in selection and set visibility based on selection 

interface ViewerProps {
    ifcModel: FRAGS.FragmentsGroup | undefined;
    components: OBC.Components | undefined;
}

export const ViewerFiber: React.FC<ViewerProps> = ({ifcModel, components}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const containerRef = useRef(null);                               //only need this if passing it into the ifc creation object
    const camera = useRef(null);                               //only need this if passing it into the ifc creation object
    const [fragGroup,setFragGroup] = useState<FRAGS.FragmentsGroup | undefined>();
    const [loading, setLoading] = useState(false);
    const [buildingElements, setBuildingElements] = useState<buildingElement[]>([]);

    const [component, setComponents] = useState<OBC.Components>();

    useEffect(() => {
        const fetchBuildingElements = async () => {

            console.log("fetching building elements",ifcModel)
            if(ifcModel) {
                setLoading(true)
                setFragGroup(ifcModel);
                try{
                    const newBuildingElements = await GetBuildingElements(ifcModel,components);
                    setBuildingElements(newBuildingElements);
                    console.log(newBuildingElements)
                    console.log(newBuildingElements.length," building elements found and set")
                 } catch (error) {
                    console.error("Error fetching building elements",error)
                } finally {
                    setLoading(false)
                }
            }
            if(components)
                setComponents(components);
        
        };

        fetchBuildingElements();
    },[ifcModel,components]);

    useEffect(() => {
        //console.log("elements changed, grouping starting")
        //set data for table
    }, [buildingElements])


    const handleSelect = (selected: THREE.Intersection[]) => {
        selected.forEach(mesh => {
            console.log('Selected objects:', mesh.object);
            if(mesh.object instanceof FRAGS.FragmentMesh && mesh.object.material[0] instanceof THREE.MeshStandardMaterial)
            {
                mesh.object.fragment.setVisibility(true);
                // console.log('Frag', mesh.object);
                // //var oldColor = child.instanceColor.array;
                // const material = mesh.object.material[0];
                // material.wireframe = !material.wireframe;
                //             //material.color = new THREE.Color(oldColor[0],oldColor[1],oldColor[2]);

            }
        })
      };
    

    if(loading) return <div>Loading...</div>;
    return (
        <>
        <Overlay ifcModel={ifcModel} components={components} buildingElements={buildingElements}/>
        <Canvas
        ref={containerRef}
        shadows
        camera={ {
            fov: 45,
            near: 0.1,
            far: 200,
            position: [ - 4, 3, 6 ],
        } }
        >
            {/* <CameraControler ifcModel={fragGroup} />? */}
            <OrbitControls makeDefault /> 

            <RaycasterComponent onSelect={handleSelect}/>           
            <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
            <ambientLight intensity={ 6.5 } />

            <GizmoHelper alignment="top-right" margin={[80, 50]}>
                <GizmoViewcube color={colors.primary[400]} textColor={colors.grey[100]} strokeColor={colors.grey[100]}/>
            </GizmoHelper>  

            <Grid 
            infiniteGrid={true}
            cellColor={colors.primary[400]}
            sectionColor={colors.primary[400]}
            fadeDistance={25}
            fadeStrength={1}/>

            <LoadModel ifcModel={fragGroup}></LoadModel>
    </Canvas>
    </>
      );
}



interface RayCasterProps {
    onSelect: (selected : THREE.Intersection[]) => void;
}

const RaycasterComponent: React.FC<RayCasterProps> = ({onSelect}) => {
    const { gl, scene, camera } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const hitPoint = useRef();

    const handleMouseMove = (event: any) => {
        // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
        // mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        // mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = (event.clientX / rect.width) * 2 -1;
    mouse.current.y = -(event.clientY / rect.height) * 2 + 1;
    };

    const handleClick = () => {
        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            onSelect(intersects);
            return new THREE.SphereGeometry(15, 32, 16);
        }
    };

    useEffect(() => {
        gl.domElement.addEventListener('mousemove', handleMouseMove);
        gl.domElement.addEventListener('click', handleClick);

        return () => {
            gl.domElement.removeEventListener('mousemove', handleMouseMove);
            gl.domElement.removeEventListener('click', handleClick);
        };
    }, [gl.domElement]);

    return (<>
        <mesh>
        </mesh>
    </>);
};

export default ViewerFiber;