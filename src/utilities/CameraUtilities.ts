
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { ModelCache } from "../bim-components/modelCache";
import * as THREE from "three";
import { CameraProjection } from "@thatopen/components";


/**
 * set plan view by changing projection to Orthographic and navMode to Plan. then zoom to all elements
 * regalress of whether visible or not
 * @param components 
 * @returns 
 */
  export async function setPlanView(components: OBC.Components) {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;

    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    cam.projection.set("Orthographic");
    cam.set("Plan" as OBC.NavModeID);

    const bbox = new THREE.Box3().setFromObject(cache.world.scene.three);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    // Calculate the larger of width and depth for optimal framing
    const maxSize = Math.max(size.x, size.z);

    // Set camera position
    const cameraHeight = maxSize * 5; // Ensure camera is high enough

    // Set camera target to look at the center
    cam.controls.camera.up.set(size.x > size.z ? 0 : 1, 1, 0);
    await cam.controls.setLookAt(center.x, cameraHeight, center.z, center.x, center.y, center.z, false);
    console.log("cam target center:", center.x, center.y, center.z);
    zoomAllorSelected(components,false);
  };

  /**
   * zoom to all elements, optionaly zoom to only selected elements determined with the OBF.Highlighter.Selected elements
   * @param components 
   * @param zoomSelected 
   * @returns 
   */
  export async function zoomAllorSelected(components: OBC.Components,zoomSelected: boolean) {
    if (!components) return;
    const cache = components.get(ModelCache);
    const bboxer = components.get(OBC.BoundingBoxer);
    if (!cache.world) return;


    if(zoomSelected)
    {
      const highlighter = components.get(OBF.Highlighter);
      const selected  = highlighter.selection["select"];
      if(selected){
      await highlighter.highlightByID('select',selected,true,true,undefined,undefined);
      return;
    }
    }

    setTimeout(async () => {
      if (!cache.world?.meshes || cache.world.meshes.size === 0) return;
      cache.world.meshes.forEach(m => bboxer.addMesh(m))
      // let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
      await cache.world.camera?.controls?.fitToSphere(bboxer.getSphere(),true)
      // await cam.fit(cache.world?.meshes, 0.5);
    }, 50);
  };

  /**
   * set camera to orthogonal view. meaning to view the model from above on an angle to get whole view
   * of model. do not change Projection or NavMode unless requested
   * @param components 
   * @returns 
   */
  export async function setOrthogonalView(components: OBC.Components, projection: CameraProjection | undefined, navMode: undefined | OBC.NavModeID) {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;

    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    //cam.projection.set("Orthographic");
    //cam.set("Plan" as OBC.NavModeID);

    const bbox = new THREE.Box3().setFromObject(cache.world.scene.three);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    // Calculate the larger of width and depth for optimal framing
    const maxSize = Math.max(size.x, size.z);

    // Set camera position
    const cameraHeight = maxSize * 5; // Ensure camera is high enough

    // Calculate the distance the camera should be from the center of the bounding box
    const maxDim = Math.max(size.x, size.y, size.z);
    //const fov = cam.three.fov * (Math.PI / 180); // convert vertical fov to radians

    let cameraDistance = maxDim; /// (2 * Math.tan(fov / 2));

    // Add some padding to the distance
    cameraDistance *= 1.2;
    if(projection !== undefined){
        cam.projection.set(projection);
    }
    if(navMode !== undefined) {
        cam.set(navMode);
    }

    // Set camera target to look at the center
    cam.controls.camera.up.set(0, 1, 0);
    // cam.controls.camera.up.set(size.x > size.z ? 0 : 1, 1, 0);

    const calc = cameraDistance / Math.sqrt(2);
    await cam.controls.setLookAt(
      center.x + calc,
      center.y + calc,
      center.z + calc,
      center.x,
      center.y,
      center.z,
      false
    );
    zoomAllorSelected(components,false);
  };
/**
 * set the Camera Navigation mode and zoom if true.
 * @param components 
 * @param newMode 
 * @param zoom 
 * @returns 
 */
  export function setCameraNavigation(components: OBC.Components, newMode: OBC.NavModeID, zoom: boolean) {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;
    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    console.log("cam mode setting:", newMode);

    cam.set(newMode)
    cam.controls.camera.up.set(0, 1, 0);
    cam.controls.updateCameraUp();
    if(zoom) {
      zoomAllorSelected(components,true);
    } 
  };

/**
 * set camera projection and zoom to all if set to true
 * @param components 
 * @param newProjection 
 * @param zoom 
 * @returns 
 */
  export function setCameraProjection (components: OBC.Components,newProjection: CameraProjection, zoom: boolean) {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;
    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;

    if (cam.projection.current === newProjection) return;

    console.log("cam mode setting:", newProjection);

    if (newProjection === "Orthographic") {
      cam.set("Orbit" as OBC.NavModeID);
      cam.projection.set("Orthographic");
    } else if (newProjection === "Perspective") {
      cam.projection.set("Perspective");
      cam.set("Orbit" as OBC.NavModeID);
    }
    cam.controls.camera.up.set(0, 1, 0);
    cam.controls.updateCameraUp();

    if(zoom) {
      zoomAllorSelected(components,false);
    } 
  };