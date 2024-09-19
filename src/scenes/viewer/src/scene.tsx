import "../../../styles.css";
import { useEffect, useRef } from "react";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { SetUpWorld } from "./SetUpWorld";
import Overlay from "../../overlay";
import { ModelCache } from "../../../bim-components/modelCache";
import { HighlightExtension } from "../../../bim-components/highlightExtension";
import Stats from "stats.js";

/**
 * Holds the three js scene and manages adding models and removing modesl from scene as
 * well as world createn. any Bim components that are UI dependend should also have their set up here
 * @returns
 */
export const Scene = () => {
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
      modelCache.onWorldSet.add((data) => (highlightExtension.world = data));

      highlightExtension.enabled = true;

      if (modelCache.world && worlds.list.has(modelCache.world.uuid)) {
      } else if (worlds.list.size === 0) {
        createWorld(components);
      }

      if (modelCache.world) {
        // set up culler
        // const cullers = components.get(OBC.Cullers);
        // const culler = cullers.create(modelCache?.world,{updateInterval: 50});
        // culler.threshold = 30;
        // culler.renderDebugFrame = true;
        // const debugFrame = culler.renderer.domElement;
        // document.body.appendChild(debugFrame);
        // debugFrame.style.position = "fixed";
        // debugFrame.style.left = "0";
        // debugFrame.style.bottom = "0";
        // debugFrame.style.visibility = "collapse";
        // if (modelCache.world !== undefined) {
        //   modelCache.world.camera.controls?.addEventListener("controlend", () => {
        //     culler.needsUpdate = true;
        //   });
        // }

        const stats = new Stats();
        stats.showPanel(2);
        document.body.append(stats.dom);
        stats.dom.style.left = "0px";
        stats.dom.style.zIndex = "unset";
        modelCache.world.renderer?.onBeforeUpdate.add(() => stats.begin());
        modelCache.world.renderer?.onAfterUpdate.add(() => stats.end());

      }
    } else if (components) {
      console.log("failed to set up or resize world due to missing data", mountRef, components);
    }

    return () => {
      console.log("view port, cleaning up");
      if (!components) return;
      const highlightExtension = components.get(HighlightExtension);
      const modelCache = components.get(ModelCache);
      fragments?.onFragmentsLoaded.remove((model) => loadModelIntoWorld(model));
      modelCache.onWorldSet.remove((data) => (highlightExtension.world = data));
      if (modelCache.world !== undefined) {
        modelCache.world?.camera.controls?.removeAllEventListeners();
      }
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
      //const cullers = components.get(OBC.Cullers);
      //const culler = cullers.create(modelCache?.world);

      //add current model again
      for (const frag of data.items) {
        modelCache?.world.meshes.add(frag.mesh);
        //culler.add(frag.mesh);
      }

      modelCache?.world.scene.three.add(data);
      //culler.needsUpdate = true;

      setTimeout(async () => {
        const cam = modelCache?.world?.camera as OBC.OrthoPerspectiveCamera;
        if (modelCache?.world?.meshes) cam.fit(modelCache?.world?.meshes, 0.8);
      }, 50);
    }
  };

  return (
    <>
      <div
        className="scene"
        ref={mountRef}
        style={{
          position: "relative",
          // display: "flex",
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
