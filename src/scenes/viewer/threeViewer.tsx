import '../../styles.css'
import { useContext, useEffect, useRef, useState} from 'react'
import * as FRAGS from "@thatopen/fragments";
import * as OBC from "@thatopen/components";
import Overlay from '../overlay/overlay';
import * as OBF from "@thatopen/components-front"
import { ComponentsContext } from '../../context/ComponentsContext';
import { SetUpWorld } from './SetUpWorld';
import { ModelStateContext } from '../../context/ModelStateContext';
import { buildingElement, GroupingType } from '../../utilities/BuildingElementUtilities';


// a three scene uses the containerRef from Context as the parent for the three scene and is where the scene will be a child too.
export const ThreeScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const components = useContext(ComponentsContext);
  const modelContext = useContext(ModelStateContext);
  const [world,setWorld] = useState<OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer>>();
  const [worldId,setWorldId] = useState<string>();


  
  

  // add ifcModel to the scene

  useEffect(() => {

    if(!components || modelContext?.currentModel.items.length === 0)
       {
        console.log("Falied to set model",components, modelContext?.currentModel)
        return;
       }
    console.log('Three viewer setting new model',modelContext)

    if(components && modelContext?.currentModel)
    {
      const worlds = components.get(OBC.Worlds)     

      const www = worlds.list.values().next().value;
      if(www)
      {
        console.log("found a www world ;)", www)
        //setWorld(www)
        for(const frag of modelContext?.currentModel.items)
        {
          www.meshes.add(frag.mesh)
        }
        www.scene.three.add(modelContext?.currentModel);
  
        setTimeout(async () => {
          www.camera.fit(www.meshes, 0.8)
        }, 50)
      }

      // if(worlds.list.size !== 0)
      {
        const foundWorld = worlds.list.entries().next().value[1];
      console.log('the world captured as',foundWorld)
      if(foundWorld)
      {
        for(const frag of modelContext?.currentModel.items)
        {
          foundWorld.meshes.add(frag.mesh)
        }
        foundWorld.scene.three.add(modelContext?.currentModel);
  
        setTimeout(async () => {
          foundWorld.camera.fit(foundWorld.meshes, 0.8)
        }, 50)
      }
     
    }
    }
    else
    {
      //console.log("Failed to add ifc model to scene, data missing.")
      // console.log("current world", world)
      //console.log("current worlds", components?.get(OBC.Worlds))
      // console.log("current components", components)
      //console.log("current ifc model", modelContext?.currentModel)
    }
  }, [modelContext?.currentModel])
  
  // Clean up on unmount
  useEffect(() => {

    // create world
    // if(components && !world)
    // {
    //   const worlds = components.get(OBC.Worlds) 
    //   let mainExists = false;
    //   let mainWorld: undefined | OBC.SimpleWorld;
    //   for(const [key,value] of worlds.list)
    //   {
    //     console.log('world found:', key,value); 
    //     if(value.name === 'main' && value instanceof OBC.SimpleWorld)
    //       mainWorld = value

    //   }  
    //   const newWorld = mainWorld === undefined? SetUpWorld(components,containerRef.current) : mainWorld;
    //   // const newWorld = SetUpWorld(components,containerRef.current);
    //   if(newWorld)
    //   {
    //     console.log('a new world is born',newWorld)
    //     if( newWorld instanceof OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer>)
    //     {
    //       // setWorld(worlds.list.entries().next().value[1])
    //       setWorldId(worlds.list.entries().next().value[0])
    //       //setWorld(newWorld)
    //     }
    //     components.init();
    //   }
    // }
    


    return() => {
      console.log('cleaning up trying now');
      if(world)
        {
          console.log('cleaning up viewer now');

          //world.dispose();
        }
    }
  },[])

  // when a new container ref is set make sure world is also set
  useEffect(() => {
    if(containerRef?.current && components)
    {  
      const worlds = components.get(OBC.Worlds) 
      // console.log('containerRef changed, world list:', worlds);    
      // console.log('Initial worlds:', worlds); 
      // console.log("ïnital world id state", worldId)
      // for(const [key,value] of worlds.list)
      // {
      //   console.log('world found:', key,value); 

      // }   
      const www = worlds.list.values().next().value;
      if(www)
      {
        console.log("found a www world ;)", www)
        setWorld(www)
      }
      else
      {
        const newWorld = SetUpWorld(components,containerRef.current);
        if(newWorld)
        {
          console.log('a new world is born',newWorld)
          if( newWorld instanceof OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer>)
          {
            // setWorld(worlds.list.entries().next().value[1])
            setWorldId(worlds.list.entries().next().value[0])
            setWorld(newWorld)
          }
          if(!components.enabled)
            components.init();
        }
      }

      // if(worlds.list.size < 1)
      // {
      //   console.log('world count',worlds.list.size)
      //   console.log('new world to build',worlds)
      //   const newWorld = SetUpWorld(components,containerRef.current);
      //   if(newWorld)
      //   {
      //     console.log('a new world is born',newWorld)
      //     if( newWorld instanceof OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer>)
      //     {
      //       // setWorld(worlds.list.entries().next().value[1])
      //       setWorldId(worlds.list.entries().next().value[0])
      //       setWorld(newWorld)
      //     }
      //     components.init();
      //   }
      // } 
      // else
      // {        
      //     console.log('world setting',worlds.list.entries().next().value[1])
      //     setWorld(worlds.list.entries().next().value[1])
      //     setWorldId(worlds.list.entries().next().value[0])

      // }    
    }
    else
    {
      console.log('failed to set up or resize world due to missing data')
    }

    const resizeWorld = () => {
      if(world)
      {
        world.renderer?.resize()
        world.camera.updateAspect()
      }
    }
    resizeWorld();

  }, [components,containerRef]);

  useEffect(() => {console.log("new world set", world)},[world])
  // useEffect(() => {console.log("new worldId set", worldId)},[worldId])
  // useEffect(() => {console.log("components updted", components)},[components])
  
    return (
      <>
      <div className='threeDivContainer' ref={containerRef} style={{ display: 'flex', height: '100%' }}>
      <Overlay ifcModel={modelContext?.currentModel}/>
      </div>
      </>
    )
  }
  

export default ThreeScene;