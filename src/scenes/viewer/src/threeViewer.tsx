import "../../styles.css";
import { useContext, useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import Overlay from "../../overlay";
import * as BUI from "@thatopen/ui";
import * as OBF from "@thatopen/components-front"
import { ComponentsContext } from "../../../context/ComponentsContext";
import { SetUpWorld } from "./SetUpWorld";
import { useModelContext } from "../../../context/ModelStateContext";
import { PostproductionRenderer } from "@thatopen/components-front";
import { OrthoPerspectiveCamera } from "@thatopen/components";

// a three scene uses the containerRef from Context as the parent for the three scene and is where the scene will be a child too.
export const ThreeViewer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const components = useContext(ComponentsContext);
  const modelContext = useModelContext();
  const [world,setWorld] = useState<OBC.World>();
  const isInitialized = useRef(false);
  // add ifcModel to the scene
  useEffect(() => {
    console.log("model adding to scene effect running");

    if (
      !modelContext?.currentWorld ||
      modelContext?.currentModel.items.length === 0 ||
      !components
    ) {
      if (modelContext?.currentModel.items.length !== 0) {
        console.log(
          "Falied to set model",
          components,
          modelContext?.currentModel
        );
      }
      return;
    }

    if (!modelContext?.currentWorld.scene) {
      console.log("on refreshing page no scene found");
      return;
    }

    for (const frag of modelContext?.currentModel.items) {
      modelContext?.currentWorld.meshes.add(frag.mesh);
    }

    modelContext?.currentWorld.scene.three.add(modelContext?.currentModel);
    console.log("elements added to scene", modelContext?.currentWorld.scene.three);

    // console.log("elements added to scene.", modelContext?.currentWorld);
    setTimeout(async () => {
      let cam = modelContext?.currentWorld?.camera as OrthoPerspectiveCamera;
      if (modelContext?.currentWorld?.meshes)
        cam.fit(modelContext?.currentWorld?.meshes, 0.8);
    }, 50);

    return () => {
      console.log("model adding to scene effect cleaning up");

    }
  }, [modelContext?.currentModel]);

  // when a new container ref is set make sure world is also set
  useEffect(() => {
    console.log("World setup effect running");
    if (!components || !containerRef.current || isInitialized.current) return;

    BUI.Manager.init();

    if (!modelContext?.currentWorld) {
      let world = SetUpWorld(components, containerRef.current, "Main"); // as OBC.World;
      console.log("Viewer setting up world", containerRef.current, world);
      // world?.scene.
      if(world)
        modelContext?.setWorld(world);
    }
    if (!components.enabled) 
      components.init;

    isInitialized.current = true;

    return () => {
      console.log("World setup effect cleaning up");

      if (modelContext?.currentWorld) {
        // Clean up world resources here
        console.log("disposing of world", modelContext?.currentWorld);
        //world.dispose();
      }
    };
  }, [components, containerRef]);

  // useEffect(() => {
  //   if(!modelContext?.currentWorld)
  //     return;
  //   const handleResize = () => resizeWorld(modelContext?.currentWorld);
  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   modelContext?.currentWorld?.update();
  //   // return () => window.removeEventListener("resize", handleResize);
  // }, [modelContext?.currentWorld]);

  useEffect(() => {
    console.log("world update effect starting")
    const intervalId = setInterval(() => {
      if (modelContext?.currentWorld) {
        modelContext.currentWorld.update();
      }
    }, 1000 / 60); // 60 FPS

    return () => {
          console.log("world update effect ending")
          clearInterval(intervalId);
    }
  }, [modelContext?.currentWorld]);

  return (
    <>
      <div
        className="threeDivContainer"
        ref={containerRef}
        style={{ display: "flex", width: "100%", height: "100%" }}
      >
        <Overlay />
      </div>
    </>
  );
};

const resizeWorld = (world: OBC.World | undefined | null) => {
  // console.log("resize world", world);
  if (world) {
    let renderer = world.renderer as PostproductionRenderer;
    let camera = world.camera as OrthoPerspectiveCamera;
    renderer?.resize();
    camera?.updateAspect();
  }
};

export default ThreeViewer;
