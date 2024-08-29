import "../../styles.css";
import { useContext, useEffect, useRef } from "react";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { useComponentsContext } from "../../context/ComponentsContext";
import { SetUpWorld } from "./src/SetUpWorld";
import Overlay from "../overlay";
import { ModelCache } from "../../bim-components/modelCache";
import { ViewportGizmo } from "three-viewport-gizmo";
import { HighlightExtension } from "../../bim-components/highlightExtension";


/**
 * Holds the three js scene and manages adding models and removing modesl from scene as
 * well as world createn. any Bim components that are UI dependend should also have their set up here
 * @returns 
 */
export const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const components = useComponentsContext();

  const fragments = components?.get(OBC.FragmentsManager);
  if (fragments) {
    fragments;
  }

  // create the world and start listening to loader
  useEffect(() => {
    if (!mountRef.current) return;

    if (mountRef?.current && components) {
      console.log("view port, setting up");

      const fragments = components?.get(OBC.FragmentsManager);
      const highlightExtension = components.get(HighlightExtension);
      const modelCache = components.get(ModelCache);
      const worlds = components.get(OBC.Worlds);
      
      fragments.onFragmentsLoaded.add((data) => loadModelIntoWorld(data));
      modelCache.onWorldSet.add((data) => highlightExtension.world = data);
    
      highlightExtension.enabled = true;
      
      if (modelCache.world && worlds.list.has(modelCache.world.uuid)) return;
      if (worlds.list.size === 0) {
        createWorld(components);
      }
    } else if (components) {
      console.log("failed to set up or resize world due to missing data", mountRef, components);
    }

    return () => {
      console.log("view port, cleaning up");
      if(!components) return;
      const highlightExtension = components.get(HighlightExtension);
      const modelCache = components.get(ModelCache);
      fragments?.onFragmentsLoaded.remove((model) => loadModelIntoWorld(model));
      modelCache.onWorldSet.remove((data) => highlightExtension.world = data)
    };
  }, [components]);

  const createWorld = (components: OBC.Components): OBC.World | undefined => {
    const modelCache = components.get(ModelCache);

    const newWorld = SetUpWorld(components, mountRef.current, "Main");
    if (newWorld) {
      if (modelCache) modelCache.world = newWorld;
      components.init();
    }
    return newWorld;
  };

  const loadModelIntoWorld = (data: FRAGS.FragmentsGroup) => {
    if (!components) return;
    const modelCache = components.get(ModelCache);

    if (!modelCache?.world) {
      createWorld(components);
    }

    // also check if already in scene before being here
    if (modelCache?.world && components) {
      //add current model again
      for (const frag of data.items) {
        modelCache?.world.meshes.add(frag.mesh);
      }

      modelCache?.world.scene.three.add(data);


      setTimeout(async () => {
        const cam = modelCache?.world?.camera as OBC.OrthoPerspectiveCamera;
        if (modelCache?.world?.meshes) cam.fit(modelCache?.world?.meshes, 0.8);
      }, 50);
    }
  };

  return (
    <>
      <div
        className="threeDivContainer"
        ref={mountRef}
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden", // This prevents child elements from overflowing
        }}
      >
        <Overlay />
      </div>
    </>
  );
};
