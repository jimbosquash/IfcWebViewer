import * as THREE from "three"
import { Html, OrbitControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Add, AddCircleRounded, ControlPointSharp } from "@mui/icons-material"
import { useRef,useState } from "react"
import React from "react"
import { defaultGetRowsToExport } from "@mui/x-data-grid/internals"
import { green } from "@mui/material/colors"
import UploadIfcButton from "../../components/uploadIfcButton"
import {Button, Fab, useTheme} from "@mui/material";
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';


import {tokens} from "../../theme"
import { useEffect } from "react"



// points of interest

const points = [
    {
        position: new THREE.Vector3(1.55,0.3,-0.6),
        element: document.querySelector(".point-0")   
    }
]


export default function SpinnningBox() {
    const cube = useRef();
    const [hovered, setHovered] = useState(false);
    const [selected, setSelected] = useState(false);

    useFrame((state,delta) => {
        cube.current.rotation.y += delta * 0.2;


        for(const point of points)
        {
            const screenPos = point.position.clone();
        }
    })

    const eventHandler = (event) => {
        console.log("the event occured")
        // cube.current.material.color.set(green);
        //cube.current.wireframe = !cube.current.wireframe;
        setSelected(!selected)
        console.log(cube.current.wireframe)
    }
    
    return<>
    <OrbitControls/>
    <mesh  ref={cube} onClick={eventHandler} 
    onPointerOver={(event) => {setHovered(true);console.log('hover')}}
    onPointerOut={(event) => {setHovered(false)}}>
        <Html> 
            <FloatingButton parentMesh={cube}/>
        </Html>
        <boxGeometry/>
        <meshBasicMaterial color={ hovered ? 'hotpink' : 'orange'} wireframe={selected}/>
    </mesh>
    </>
}


function FloatingButton({parentMesh}) {
    const card = useRef();
    const [showMessage,setShowMessage] = useState();
    const [zoom,setZoom] = useState(0);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    useEffect(() => {
        console.log("message show = ", showMessage)
    },[showMessage])

    return (
        <div>
            <Fab size="small" 
            sx={{
                backgroundColor: colors.blueAccent[600],
                transform: zoom ? "scale(1.2)" : "scale(0.8)",
                transition: "transform 0.18s ease-in-out",
            }}
            onMouseEnter={() => {
                setZoom(true)
                setShowMessage(true)}} 
            onMouseLeave={() => {
                setZoom(false)
                setTimeout(() => {
                    console.log(card.current);
                    if (!document.querySelector(':hover').classList.contains('MuiCard-root')) {
                        console.log(document.querySelector(':hover').classList);
                        setShowMessage(false);
                    }
                }, 200)}}>
                <Add/>
            </Fab>
            {showMessage && <BasicCard />}
            
        </div>
    );
}


export function BasicCard() {

    return (
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            CE-1234-0901-0001
          </Typography>
          <Typography variant="h5" component="div">
            {/* be{bull}nev{bull}o{bull}lent */}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            LVLQ 33
          </Typography>
          <Typography variant="body2">
            This is over 20kg and should be handeled by multiple people <br />
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Comment</Button>
        </CardActions>
      </Card>
    );
  }


// <Button 
//                 onMouseEnter={() => {setShowMessage(true)}} 
//                 onMouseLeave={() => {setShowMessage(false)}}
//                 sx={{
//                     backgroundColor: colors.blueAccent[700],
//                     color: colors.grey[100],
//                     fontSize: "10px",
//                     fontWeight: "bold",
//                     // width: "auto",
//                     top:"-20px",
//                     left:"-50px",
//                     whiteSpace: "nowrap",
//                     padding: "10px 20px",
//                 }}>
//                 {/* <UploadOutlinedIcon sx={{ mr: "10px" }} /> */}
//                 {showMessage && <h4>I am showing a message</h4>}
//             </Button>
            