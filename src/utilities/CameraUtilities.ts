import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { ModelCache } from "../bim-components/modelCache";
import * as THREE from "three";
import { CameraProjection } from "@thatopen/components";
import { GetAllVisibleExpressIDs } from "./IfcUtilities";
import { zoomToBuildingElements } from "./BuildingElementUtilities";
import { BuildingElement } from "./types";
import { ConfigurationManager } from "../bim-components/configManager";


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

  setAndSaveCamNavigation('Plan',cam,components)
  setAndSaveCamProjection('Orthographic',cam,components)

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
  if (!cache.world?.meshes || cache.world.meshes.size === 0)
    return;

    await zoomToVisible(components)
};

/**
 * Save the new setting to configurationManager for local storage management 
 */
function setAndSaveCamNavigation (navMode: OBC.NavModeID,cam: OBC.OrthoPerspectiveCamera,components: OBC.Components) {
  cam.set(navMode)
  components?.get(ConfigurationManager).camConfig.set('navMode', navMode);
}

/**
 * Save the new setting to configurationManager for local storage management 
 */
function setAndSaveCamProjection (projection: OBC.CameraProjection,cam: OBC.OrthoPerspectiveCamera,components: OBC.Components) {
  cam.projection.set(projection)
  components?.get(ConfigurationManager).camConfig.set('projection',projection);
}

/**
 * Set view to input view desired. will set nav mode to orthogonal and pan.
 * @param components 
 * @param viewType 
 * @param zoomVisible if true zoom to visible geometry, if false zoom to all model. if undefined do not zoom
 * @returns 
 */
export async function setView(components: OBC.Components, viewType: "front" | "back" | "left" | "right" | "top" | "bottom", zoomVisible: boolean | undefined) {
  const cache = components?.get(ModelCache);
  if (!cache?.world) return;

  let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
  setAndSaveCamProjection("Orthographic",cam,components)

  // get geometry to fit to view + creat bbox
  const bboxer = components.get(OBC.BoundingBoxer);

  if (!cache.world.meshes || cache.world.meshes.size === 0) return;
  cache.world.meshes.forEach(m => bboxer.addMesh(m))
  //const bbox = new THREE.Box3().setFromObject(cache.world.scene.three);
  const bbox = bboxer.get();
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());

  // Calculate the larger of width and depth for optimal framing
  const maxSize = Math.max(size.x, size.z);
  // Set camera position
  const cameraDistance = maxSize * 5; // Ensure camera is high enough


  // get camera position based on view type

  let viewDirection: THREE.Vector3;
  switch (viewType) {
    case 'front':
      viewDirection = new THREE.Vector3(-1, 0, 0)
      break;
    case 'back':
      viewDirection = new THREE.Vector3(1, 0, 0)
      break;
    case 'right':
      viewDirection = new THREE.Vector3(0, 0, 1)
      break;
    case 'left':
      viewDirection = new THREE.Vector3(0, 0, -1)
      break;
    case 'top':
      viewDirection = new THREE.Vector3(0, 1, 0)
      cam.controls.camera.up.set(size.x > size.z ? 0 : 1, 1, 0);
      break;
    case 'bottom':
      viewDirection = new THREE.Vector3(0, -1, 0)
      cam.controls.camera.up.set(size.x > size.z ? 0 : 1, 1, 0);
      break;
  }

  // Set camera target to look at the center
  await cam.controls.setLookAt(viewDirection.x * cameraDistance, viewDirection.y * cameraDistance, viewDirection.z * cameraDistance, center.x, center.y, center.z, false);
  // console.log("cam target center:", viewDirection, center.x, center.y, center.z);

  await cam.controls.fitToBox(bbox, false, { cover: false, paddingTop: -2, paddingBottom: -2, paddingLeft: -1, paddingRight: -1 })
  await zoomToVisible(components);

};

export async function zoomToVisible(components: OBC.Components, buffer : number = 0.8) {

  const cache = components.get(ModelCache);

  const visibleExpressIDs = GetAllVisibleExpressIDs(cache.models());

  const visibleElements: BuildingElement[] = [];
  visibleExpressIDs.forEach((expressIDs,modelID) => {
    expressIDs.forEach(expressID => { 
      const e = cache.getElementByExpressId(expressID,modelID);
      if(e) visibleElements.push(e)})
  })

  await  zoomToBuildingElements(visibleElements,components,false,buffer)
};

/**
 * zoom to all elements, optionaly zoom to only selected elements determined with the OBF.Highlighter.Selected elements
 * @param components 
 * @param zoomSelected 
 * @returns 
 */
export async function zoomAllorSelected(components: OBC.Components, zoomSelected: boolean, transition: boolean = true) {
  if (!components) return;
  const cache = components.get(ModelCache);
  if (!cache.world) return;

  if (zoomSelected) {
    const highlighter = components.get(OBF.Highlighter);
    const selected = highlighter.selection["select"];
    if (selected) {
      await highlighter.highlightByID('select', selected, true, true, undefined, undefined);
      return;
    }
  }

  if (!cache.world?.meshes || cache.world.meshes.size === 0)
    return;

  zoom(components, cache.world.meshes, cache.world.camera, true, transition)
};

/**
 * 
 * @param components 
 * @param meshes 
 * @param camera 
 * @param fitToSphere if flase then will fit to box, this can make unextected views
 */
export async function zoom(components: OBC.Components, meshes: Set<THREE.Mesh>, camera: OBC.BaseCamera, fitToSphere: boolean, transition: boolean) {
  const bboxer = components.get(OBC.BoundingBoxer);

  // you can get rid of the time out
  setTimeout(async () => {
    if (!meshes || meshes.size === 0) return;
    meshes.forEach(m => bboxer.addMesh(m))
    // let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    if (fitToSphere) {
      await camera?.controls?.fitToSphere(bboxer.getSphere(), transition)
    } else {
      await camera?.controls?.fitToBox(bboxer.getMesh(), transition)
    }

    // await cam.fit(cache.world?.meshes, 0.5);
  }, transition ? 50 : 0);
}

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

  if(cam.three instanceof THREE.PerspectiveCamera) {
    console.log('fov',cam.three.fov); // edit?
  }

  let cameraDistance = maxDim; /// (2 * Math.tan(fov / 2));

  // Add some padding to the distance
  cameraDistance *= 1.2;
  if (projection !== undefined) {
    cam.projection.set(projection);
  }
  if (navMode !== undefined) {
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
  await zoomToVisible(components,0.80)
  // await zoomAllorSelected(components, false,false);
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

  setAndSaveCamNavigation(newMode,cam,components)
  cam.controls.camera.up.set(0, 1, 0);
  cam.controls.updateCameraUp();
  if (zoom) {
    zoomAllorSelected(components, true);
  }
};

/**
 * set camera projection and zoom to all if set to true
 * @param components 
 * @param newProjection 
 * @param zoom 
 * @returns 
 */
export function setCameraProjection(components: OBC.Components, newProjection: CameraProjection, zoom: boolean) {
  const cache = components?.get(ModelCache);
  if (!cache?.world) return;
  let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;

  if (cam.projection.current === newProjection) return;

  console.log("cam mode setting:", newProjection);

  if (newProjection === "Orthographic") {
    setAndSaveCamNavigation('Orbit',cam,components)
    setAndSaveCamProjection('Orthographic',cam,components)

  } else if (newProjection === "Perspective") {
    setAndSaveCamNavigation('Orbit',cam,components)
    setAndSaveCamProjection('Perspective',cam,components)

  }
  cam.controls.camera.up.set(0, 1, 0);
  cam.controls.updateCameraUp();

  if (zoom) {
    zoomToVisible(components,0.55)
  }
};
