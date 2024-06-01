import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewcube, Grid, CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import {useControls} from "leva";
// import { FRAGS } from 'frag-library';
// import { useTheme } from '@material-ui/core/styles';
// import { tokens } from './theme';

export const CameraController: React.FC<{ ifcModel: any }> = ({ ifcModel }) => {
    const cameraRef = useRef<any>();
    const controlsRef = useRef<any>();
    const {camera, gl} = useThree();
    const {position} = useControls({
        position:
        {
            value: { x: 0, y:1, z: 1},
            step: 0.1,
        }
    })
    // camera.position.set(position.x,position.y,position.z)

    const updateCamera = useCallback(() => {
        if (ifcModel && cameraRef.current) {
            // Calculate the bounding box of the IFC model and update the camera
            const bbox = new THREE.Box3().setFromObject(ifcModel);
            const center = bbox.getCenter(new THREE.Vector3());
            const size = bbox.getSize(new THREE.Vector3());

            // Update the camera position to fit the bounding box
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = cameraRef.current!.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / 2 * Math.tan(fov / 2)) * 2;
            
            console.log("updateing camera location", position)
            console.log("updateing camera look at", center)
            // cameraRef.current.position.set(center.x, center.y + 3, position);
            // controlsRef.current?.target.copy(center);
            // controlsRef.current?.update();

        }
    }, [ifcModel]);

    useEffect(() => {
        //cameraRef.current.position.set(position.x, position.y, position.z);
            //controlsRef.current?.target.copy(center);
            // console.log("seting position",position)
            // console.log("seting position for cam",cameraRef.current)
            // controlsRef.current?.update();
    }, [position])

    useEffect(() => {
        // position.x = cameraRef.current.position.x;
        // position.y = cameraRef.current.position.y;
        // position.z = cameraRef.current.position.z;

    }, [cameraRef.current])

    useEffect(() => {
        updateCamera();
    }, [ifcModel, updateCamera]);
    // dampingFactor={0.08}
    //position={[position.x,position.y,position.z]}
    return (
        <>
        {/* <CameraControls makeDefault/> */}
            {/* <perspectiveCamera ref={cameraRef} fov={45} near={0.1} far={200}  /> */}
            <OrbitControls ref={controlsRef} makeDefault args={[camera,gl.domElement]}/> 
            {/* <mesh position={[position.x,position.y,position.z]}>
                <boxGeometry/>
                <meshStandardMaterial color="mediumpurple"/>
            </mesh> */}
        </>
    );
};

export default CameraController;