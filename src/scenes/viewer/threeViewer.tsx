import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoViewport,GizmoViewcube , GizmoHelper, CameraControls } from '@react-three/drei'
import '../../styles.css'
import { useContext, useEffect, useRef, useState} from 'react'
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
import * as OBF from "@thatopen/components-front"
import { RefContext } from '../../context/RefContext';
import { ComponentsContext } from '../../context/ComponentsContext';
import { Worlds } from '@thatopen/components';
import { BuildingElementsContext } from '../../context/BuildingElementsContext';



//todo
// 1. display element table
// 2. display all tasks
// 1. get fragment hit in selection and set visibility based on selection 

interface ViewerProps {
    ifcModel: FRAGS.FragmentsGroup | undefined;
    components: OBC.Components | undefined;
}

export const ThreeViewer = ({ifcModel, components} : ViewerProps) => {
    const theme = useTheme();
    const containerRef = useContext(RefContext);
    const colors = tokens(theme.palette.mode);
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
            if(containerRef?.current)
            {
                console.log('containerRef', containerRef.current)

                if(components)
                {
                    console.log("components",components);
                    const worlds = components.get(OBC.Worlds);
                    console.log("components worlds",components.get(OBC.Worlds));

                    const world = worlds.create<
                        OBC.SimpleScene,
                        OBC.SimpleCamera,
                        OBC.SimpleRenderer
                        >();

                        world.scene = new OBC.SimpleScene(components)
        world.renderer = new OBF.PostproductionRenderer(components, containerRef.current)
        world.renderer.resize(new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight));

        const cameraComponent = new OBC.OrthoPerspectiveCamera(components);
        cameraComponent.controls.setLookAt(10, 10, 10, 0, 0, 0);
        world.camera = cameraComponent;
        world.camera.enabled;
        components.init()
        console.log("components worlds",components.get(OBC.Worlds));


                    setComponents(components);
                }
            }
        };

        fetchBuildingElements();
    },[ifcModel,components]);



    if(loading) return <div>Loading...</div>;
    return (
        <>
        <Overlay ifcModel={ifcModel} components={components}/>
        {/* <LoadModel components={component} ifcModel={fragGroup}></LoadModel> */}
    </>
      );
}

function SetUpWorld(compoenents: OBC.Components) {
  if(compoenents)
  {

  }

}

export const ThreeScene = ({ifcModel} : ViewerProps) => {

  const components = useContext(ComponentsContext);
  const buildingElements = useContext(BuildingElementsContext);
  const containerRef = useContext(RefContext);
  const [currentWorld,setWorld] = useState<OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer>>();
  const [fragGroup,setFragGroup] = useState<FRAGS.FragmentsGroup | undefined>();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    console.log("you did it! loded model",ifcModel)
    if(components && ifcModel && currentWorld)
    {
      // add to scene
      console.log('the world captured as',currentWorld)
      for(const frag of ifcModel.items)
      {
        currentWorld.meshes.add(frag.mesh)
      }
      currentWorld.scene.three.add(ifcModel);
      setTimeout(async () => {
        currentWorld.camera.fit(currentWorld.meshes, 0.8)
      }, 50)


      // const fetchBuildingElements = async () => {

      //   console.log("fetching building elements",ifcModel)
      //   if(ifcModel) {
      //       setLoading(true)
      //       setFragGroup(ifcModel);
      //       try{
      //           const newBuildingElements = await GetBuildingElements(ifcModel,components);
      //           setBuildingElements(newBuildingElements);
      //           console.log(newBuildingElements)
      //           console.log(newBuildingElements.length," building elements found and set")
      //        } catch (error) {
      //           console.error("Error fetching building elements",error)
      //       } finally {
      //           setLoading(false)
      //       }
      //   }     
      // };


      //fetchBuildingElements();

    }
  }, [ifcModel])
  
  useEffect(() => {
    console.log('container ref in three scene', containerRef?.current)
    console.log('components in three scene', components)

    if(containerRef?.current && components)
    {  
      const worlds = components.get(OBC.Worlds)     
      if(worlds.list.size === 0 || !currentWorld)
      {
        const world= worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>();
        world.name = "Main"
        world.scene = new OBC.SimpleScene(components)
        world.scene.setup()
        world.scene.three.background = null
        setWorld(world);
        
        world.renderer = new OBF.PostproductionRenderer(components, containerRef.current)
        const { postproduction } = world.renderer;
        
        console.log("renderer",postproduction)
  
        world.camera = new OBC.OrthoPerspectiveCamera(components)
        world.camera.projection.set('Orthographic');
        world.camera.enabled = true;
        // const worldGrid = components.get(OBC.Grids).create(world)
        // worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242)
        // worldGrid.material.uniforms.uSize1.value = 2
        // worldGrid.material.uniforms.uSize2.value = 8  
        setWorld(world);
        postproduction.enabled = true;
        //postproduction.customEffects.excludedMeshes.push(worldGrid.three);
        postproduction.setPasses({ custom: true, ao: true, gamma: true })
        postproduction.customEffects.lineColor = 0x17191c

      } 
      
    const resizeWorld = () => {
      if(currentWorld)
      {
        currentWorld.renderer?.resize()
        currentWorld.camera.updateAspect()
      }
    }
    resizeWorld();
    components.init();
    }
  }, [containerRef,components]);
  
  
    return (
      <>
              <Overlay ifcModel={ifcModel} components={components ?? undefined}/>
        </>
    )
  }
  

export default ThreeViewer;