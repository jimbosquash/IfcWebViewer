import * as THREE from "three"
import { Html, OrbitControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import SpinnningBox from "./spinningBox"
import {Button, Fab, IconButton, useTheme} from "@mui/material";
import ButtonGroup from '@mui/material/ButtonGroup';
import UploadIfcButton from "../../components/uploadIfcButton"
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";



export default function LandingPage() { 
// green back ground
// logo in center
// button to enter to dashboard or upload file

// #241a1a
    return<>
    <div>

    </div>
    <Canvas style={{ position: 'relative', height: '100vh' }}>
        {/* <color args={['#241a1a']} attach="background"/> */}
    
    <SpinnningBox/>
    {/* <Html position={[0,0,0]}>
    <FloatingButtonGroup/>
    </Html> */}
    </Canvas>
    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
    <FloatingButtonGroup/>

    </div>

    </>
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




