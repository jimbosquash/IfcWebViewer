import '../../styles.css'
import { useContext, useEffect, useState} from 'react'
import * as FRAGS from "@thatopen/fragments";
import * as OBC from "@thatopen/components";
import Overlay from '../overlay/overlay';
import * as OBF from "@thatopen/components-front"
import { RefContext } from '../../context/RefContext';
import { ComponentsContext } from '../../context/ComponentsContext';
import { SetUpWorld } from './SetUpWorld';

interface ViewerProps {
    ifcModel: FRAGS.FragmentsGroup | undefined;
    components: OBC.Components | undefined;
}

// a three scene uses the containerRef from Context as the parent for the three scene and is where the scene will be a child too.
export const ThreeScene = ({ifcModel} : ViewerProps) => {
  const components = useContext(ComponentsContext);
  const containerRef = useContext(RefContext);
  const [world,setWorld] = useState<OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer>>();

  // add ifcModel to the scene
  useEffect(() => {
    if(components && ifcModel && world)
    {
      console.log('the world captured as',world)
      for(const frag of ifcModel.items)
      {
        world.meshes.add(frag.mesh)
      }
      world.scene.three.add(ifcModel);

      setTimeout(async () => {
        world.camera.fit(world.meshes, 0.8)
      }, 50)
    }
    else
    {
      console.log("Failed to add ifc model to scene, data missing.")
    }
  }, [ifcModel])
  
  // when a new container ref is set make sure world is also set
  useEffect(() => {
    if(containerRef?.current && components)
    {  
      const worlds = components.get(OBC.Worlds)     
      if(worlds.list.size === 0 || !world)
      {
        const newWorld = SetUpWorld(components,containerRef.current);
        if(newWorld)
        {
          setWorld(newWorld);
          console.log('a new world is born',)
        }
      } 
    const resizeWorld = () => {
      if(world)
      {
        world.renderer?.resize()
        world.camera.updateAspect()
      }
    }
    resizeWorld();
    components.init();
    }
    else
    {
      console.log('failed to set up or resize world due to missing data')
    }

  }, [containerRef,components]);
  
    return (
      <>
        <Overlay ifcModel={ifcModel} world={world}/>
      </>
    )
  }
  

export default ThreeScene;