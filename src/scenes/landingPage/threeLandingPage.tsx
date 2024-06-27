import React, { useRef, useEffect, useContext, useState } from 'react';
import * as THREE from 'three';
import { ComponentsContext } from '../../context/ComponentsContext';
import { SetUpWorld } from '../viewer/SetUpWorld';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"



const ThreeLandingPage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const components = useContext(ComponentsContext);
  const [world,setWorld] = useState<OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer>>();
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    if(mountRef?.current && components)
    {  
      const worlds = components.get(OBC.Worlds)     
      if(worlds.list.size === 0)
      {
        console.log('new world to build',worlds)
        const newWorld = SetUpWorld(components,mountRef.current);
        if(newWorld)
        {
            setWorld(newWorld);
            console.log('a new world is born',)
            components.init();           
        }
      }  
      if(world)
            {
                console.log("try create a box",world.meshes)
                const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? "yellow" : 'green' });
            const cube = new THREE.Mesh(geometry, material);
            world.scene.three.add(cube);
            world.meshes.add(cube)

                world.camera.fit(world.meshes, 0.8)
            }     

    const resizeWorld = () => {
      if(world)
      {
        
        world.renderer?.resize()
        world.camera.updateAspect()
      }
    }
    resizeWorld();
    // components.
    }
    else
    {
      console.log('failed to set up or resize world due to missing data',mountRef,components)
    }






    // // Scene setup
    // const scene = new THREE.Scene();
    // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // const renderer = new THREE.WebGLRenderer({ antialias: true });

    // renderer.setSize(window.innerWidth, window.innerHeight);
    // mountRef.current.appendChild(renderer.domElement);

    // // Create a cube
    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // camera.position.z = 5;

    // const animate = () => {
    //   requestRef.current = requestAnimationFrame(animate);
    //   cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;
    //   renderer.render(scene, camera);
    // };
    // animate();

    // Clean up on component unmount
    return () => {
    //   cancelAnimationFrame(requestRef.current);
    //   console.log("cleanup, render", renderer.domElement);
    //   console.log("cleanup, ref", mountRef.current);
    //   if(mountRef.current)
    //     mountRef.current!.removeChild(renderer.domElement);
    //   geometry.dispose();
    //   material.dispose();
    //   renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ display: 'flex', height: '100%' }}/>;
};

export default ThreeLandingPage;
