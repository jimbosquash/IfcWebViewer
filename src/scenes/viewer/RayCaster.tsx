import React, { useEffect, useRef, useState } from 'react';
import { useThree, extend, render } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
 
interface RaycasterProps {
  onSelect: (selected: THREE.Intersection[]) => void;
}

const RaycasterComponent: React.FC<RaycasterProps> = ({ onSelect }) => {
  const { gl, scene, camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const hitPoint = useRef();
  const mouse = useRef(new THREE.Vector2());
  const [rays, setRays] = useState<THREE.Line[]>([]);

  const handleMouseMove = (event: MouseEvent) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    //mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    //mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // this is set to the changing size of the dom and not the whole screen
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = (event.clientX / rect.width) * 2 -1;
    mouse.current.y = -(event.clientY / rect.height) * 2 + 1;
    // console.log("mouse", mouse.current)

  };

  const handleClick = () => {
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    console.log("ray drawing", intersects)
    console.log("scene Children", scene.children)

    if (intersects.length > 0) {
      console.log("ray drawing")

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

    //const point = new THREE.BufferGeometry(intersection.point.clone(),0.2);
    //const geom = new THREE.Mesh(point,material);

    //scene.add(point)
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

export default RaycasterComponent;
