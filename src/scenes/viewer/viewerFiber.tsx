import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoViewcube , GizmoHelper } from '@react-three/drei'
import '../../styles.css'
import { useContext, useEffect, useRef, useState} from 'react'
import { LoadModel} from '../../utilities/modelLoader';
import * as FRAGS from "@thatopen/fragments";
import { GetBuildingElements } from '../../utilities/IfcUtilities';
import { buildingElement } from '../../utilities/BuildingElementUtilities';
import { tokens } from '../../theme';
import {useTheme } from '@mui/material';
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import { ComponentsContext } from '../../context/ComponentsContext';
import { ModelStateContext } from '../../context/ModelStateContext';
import { SetUpWorld } from './src/SetUpWorld';




export const ViewerFiber = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    // const {scene,camera,renderer}= useThree();
    const components = useContext(ComponentsContext);
    const modelState = useContext(ModelStateContext);
    const containerRef = useRef<any>(undefined);                               //only need this if passing it into the ifc creation object
    const [fragGroup,setFragGroup] = useState<FRAGS.FragmentsGroup | undefined>();
    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    // // create world
    // if(!components || !containerRef.current) return;
    
    // console.log("viewer fiber container", containerRef.current)
    // let world = SetUpWorld(components, containerRef.current)
    // // world?.camera.three = scene;
    // console.log("viewer setting up world after ifc import ",containerRef.current, world);
    // // resizeWorld(world);
    // const simpleWorld = world as OBC.World;
    // modelState?.setWorld(simpleWorld);
    // },[components]);

    if(loading) return <div>Loading...</div>;
    return (
        <>
        {/* <Overlay ifcModel={ifcModel}/> */}
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

            {/* <LoadModel components={components} ifcModel={fragGroup}></LoadModel> */}
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