import "../../styles.css";
import { useContext, useEffect, useRef } from "react";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import { ComponentsContext } from "../../context/ComponentsContext";
import { SetUpWorld } from "./src/SetUpWorld";
import { useModelContext } from "../../context/ModelStateContext";
import Overlay from "../overlay";
import { shadows } from "@mui/system";

export const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const components = useContext(ComponentsContext);
  const { currentWorld, currentModel, setWorld } = useModelContext();

  // create the world
  useEffect(() => {
    console.log("three scene useEffect components start", components);

    if (!mountRef.current) return;

    if (mountRef?.current && components) {
      const worlds = components.get(OBC.Worlds);
      if (worlds.list.size === 0) {
        console.log("new world to build", worlds);
        const newWorld = SetUpWorld(components, mountRef.current, "Main");
        if (newWorld) {
          setWorld(newWorld);
          console.log("a new world is born");
          components.init();
        }
      }
    } else {
      console.log(
        "failed to set up or resize world due to missing data",
        mountRef,
        components
      );
    }
  }, [components]);


  // add models to the world
  useEffect(() => {
    if (!currentWorld) return;

    console.log("world changed, threeScene", currentWorld);
    // if (currentWorld.camera === null) {
    //   console.log('setting up world again')
    // }

    // also check if already in scene before being here
    if(components && currentModel.items.length !== 0)
    {

        // const shadows = components.get(OBCF.ShadowDropper);
        // shadows.shadowExtraScaleFactor = 50;
        // shadows.shadowOffset = 0.1;
      
      //add current model again
      for (const frag of currentModel.items) {
        currentWorld.meshes.add(frag.mesh);
        // shadows.create([frag.mesh],"model shadow",currentWorld)

      }
  
      currentWorld.scene.three.add(currentModel);
      console.log("elements added to scene",currentModel, currentWorld.scene.three);
      

    }

    const resizeWorld = () => {
      currentWorld.renderer?.resize();
      currentWorld.camera.updateAspect();
    };
    mountRef.current?.addEventListener("resize", resizeWorld);

    // Clean up on component unmount
    return () => {
      console.log("three scene useEffect components cleanup");
      if (currentWorld) {
        const worlds = components?.get(OBC.Worlds);
        if (worlds) {
          let worldToDelete = worlds.list.get(currentWorld.uuid);
          console.log("world disposed found world to delete", worldToDelete);
          if (worldToDelete) worlds.delete(worldToDelete);
        }
        // currentWorld.dispose(true);
        console.log("world disposed", currentWorld);
        mountRef.current?.removeEventListener("resize", resizeWorld);
        setWorld(undefined);
        // if(components)
        // {const shadows = components.get(OBCF.ShadowDropper);}
        // shadows.

      }
    };
  }, [currentWorld]);

  useEffect(() => {
    if (!currentWorld || currentModel.items.length === 0 || !components) {
      console.log(
        "current model effect not entering",
        currentModel,
        currentWorld
      );
      return;
    }

    // check if the current model is already in the world
    // currentWorld.meshes

    for (const frag of currentModel.items) {
      currentWorld.meshes.add(frag.mesh);
    }

    currentWorld.scene.three.add(currentModel);
    console.log("elements added to scene",currentModel, currentWorld.scene.three);

    // console.log("elements added to scene.", modelContext?.currentWorld);
    setTimeout(async () => {
      if (currentWorld?.meshes)
        currentWorld.camera.fit(currentWorld?.meshes, 0.8);
    }, 50);

    console.log("current model effect starting", currentModel);

    return () => {
      console.log("current model effect clean up", currentModel);
    };
  }, [currentModel]);

  // when world is set we will check if current model is valid and if it is add it

  // then when the current model changes we should check is the model in the world already or should we also add it

  return (
    <>
      <div
        className="threeDivContainer"
        ref={mountRef}
        style={{ display: "flex", width: "100%", height: "100%" }}
      >
        <Overlay />
      </div>
    </>
  );
};
