import * as THREE from "three"
import { Html, OrbitControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import SpinnningBox from "./spinningBox"
import {Box, Button, Fab, IconButton, useTheme} from "@mui/material";
import ButtonGroup from '@mui/material/ButtonGroup';
import UploadIfcButton from "../../components/uploadIfcButton"
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import { useThree } from "@react-three/fiber"



export const LandingPage = () => { 
// green back ground
// logo in center
// button to enter to dashboard or upload file
const rayCaster = new THREE.Raycaster();

const handleSelect = (selected: THREE.Intersection[]) => {
  console.log("Landing page handellingselect ", selected)
} 


// #241a1a
    return(<>
    <div>

    </div>
    <Canvas style={{ position: 'relative', height: '100vh' }}>
    <ambientLight/>

        {/* <color args={['#241a1a']} attach="background"/> */}
        <RaycasterComponent onSelect={handleSelect}/>
    
    <SpinnningBox/>
    <mesh position={new THREE.Vector3(1,0,0)}>
    <boxGeometry />
        <meshStandardMaterial/>
    </mesh>
    <mesh position={new THREE.Vector3(2.1,0,0)}>
    <boxGeometry />
        <meshBasicMaterial/>
    </mesh>
    <mesh position={new THREE.Vector3(3.2,0,0)}>
    <boxGeometry  />
        <meshBasicMaterial/>
    </mesh>



    {/* <Html position={[0,0,0]}>
    <FloatingButtonGroup/>
    </Html> */}
    </Canvas>
    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
    <FloatingButtonGroup/>

    </div>

    </>)
}


function FloatingButtonGroup() {
    return<>
    <ButtonGroup>
        {/* <UploadIfcButton></UploadIfcButton> */}
        <IconButton size="large"><UploadOutlinedIcon/></IconButton>
        <IconButton><UploadOutlinedIcon/></IconButton>
        <IconButton><UploadOutlinedIcon/></IconButton>
        {/* <Button></Button> */}
    </ButtonGroup>
    </>
}


interface RaycasterProps {
    onSelect: (selected: THREE.Intersection[]) => void;
  }
  
  const RaycasterComponent: React.FC<RaycasterProps> = ({ onSelect }) => {
    const { gl, scene, camera } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const [rays, setRays] = useState<THREE.Line[]>([]);
  
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      //console.log(mouse.current.x," - ", mouse.current.y)
    };
  
    const handleClick = () => {
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
  
      if (intersects.length > 0) {  
        //onSelect(intersects);
        drawRay(intersects[0]);
      }
    };
  
    const drawRay = (intersection: THREE.Intersection) => {
      console.log("ray drawing")
      const points = [];
      points.push(raycaster.current.ray.origin.clone());
      points.push(intersection.point.clone());
  
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const line = new THREE.Line(geometry, material);
  
      scene.add(line);
      setRays((prev) => [...prev, line]);
  
      // Remove the ray after 3 seconds
      setTimeout(() => {
        scene.remove(line);
        setRays((prev) => prev.filter((ray) => ray !== line));
      }, 3000);
    };
  
    useEffect(() => {
      gl.domElement.addEventListener('mousemove', handleMouseMove);
      gl.domElement.addEventListener('click', handleClick);
  
      return () => {
        gl.domElement.removeEventListener('mousemove', handleMouseMove);
        gl.domElement.removeEventListener('click', handleClick);
      };
    }, [gl.domElement]);
  
    return null;
  };

  export default LandingPage;
  




