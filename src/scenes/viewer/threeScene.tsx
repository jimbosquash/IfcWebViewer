import "../../styles.css";
import { useContext, useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { ComponentsContext } from "../../context/ComponentsContext";
import { SetUpWorld } from "./src/SetUpWorld";
import Overlay from "../overlay";
import { ModelCache } from "../../bim-components/modelCache";
import { ModelViewManager } from "../../bim-components/modelViewer";


export const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const components = useContext(ComponentsContext);

  const fragments = components?.get(OBC.FragmentsManager);
  if (fragments) {
    fragments;
  }

  // create the world and start listening to loader
  useEffect(() => {
    if (!mountRef.current) return;

    if (mountRef?.current && components) {
      const fragments = components?.get(OBC.FragmentsManager);
      console.log("view port, setting up");
      fragments.onFragmentsLoaded.add((data) => loadModelIntoWorld(data));
      // const viewManager = components.get(ModelViewManager);
      // if (viewManager) viewManager.onTreeChanged.;
      const modelCache = components.get(ModelCache);
      const worlds = components.get(OBC.Worlds);

      if (modelCache.world && worlds.list.has(modelCache.world.uuid)) return;
      if (worlds.list.size === 0) {
        createWorld(components);
      }
    } else if (components) {
      console.log("failed to set up or resize world due to missing data", mountRef, components);
    }

    return () => {
      console.log("view port, cleaning up");

      const fragments = components?.get(OBC.FragmentsManager);
      fragments?.onFragmentsLoaded.remove((model) => loadModelIntoWorld(model));
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
