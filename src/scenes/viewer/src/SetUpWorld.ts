import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import * as THREE from 'three';


//todo
// 1. display element table
// 2. display all tasks
// 1. get fragment hit in selection and set visibility based on selection 

function setWorldElements(components: OBC.Components,containerRef: HTMLElement | null | undefined, world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>) {
  if (!world || !containerRef) return;
  world.scene = new OBC.SimpleScene(components)
  world.scene.setup()
  world.scene.three.background = null;
  
  world.renderer = new OBF.PostproductionRenderer(components, containerRef)
  const { postproduction } = world.renderer;

  world.camera = new OBC.OrthoPerspectiveCamera(components)
  world.camera.projection.set('Orthographic');
  world.camera.enabled = true;

  const worldGrid = components.get(OBC.Grids).create(world)
  worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242)
  worldGrid.material.uniforms.uSize1.value = 2
  worldGrid.material.uniforms.uSize2.value = 8

  postproduction.enabled = true;
    postproduction.customEffects.excludedMeshes.push(worldGrid.three);
    postproduction.setPasses({ custom: true, ao: true, gamma: true })
    postproduction.customEffects.lineColor = 0x17191c

}

export function SetUpWorld(components: OBC.Components, containerRef: HTMLElement | null | undefined, name: string): OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer> | undefined {
  // return undefined;  
  if (components && containerRef) {
    console.log("world creating", containerRef)
    const worlds = components.get(OBC.Worlds)
    const world = worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>();
    world.name = name;
    world.scene = new OBC.SimpleScene(components)
    world.scene.three
    world.scene.setup()
    world.scene.three.background = null;//new THREE.Color('blue')

    world.renderer = new OBF.PostproductionRenderer(components, containerRef)
    const { postproduction } = world.renderer;

    world.camera = new OBC.OrthoPerspectiveCamera(components)
    world.camera.projection.set('Orthographic');
    world.camera.enabled = true;
    const light = new THREE.AmbientLight(0x424242,30)
    // const directionalLight = new THREE.PointLight( 0xffffff );
    // directionalLight.position.y = 3;
    // directionalLight.position.z = 3;
    // directionalLight.intensity = 1000;
    world.scene.three.add( light );
    const worldGrid = components.get(OBC.Grids).create(world)
    worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242)
    worldGrid.material.uniforms.uSize1.value = 2
    worldGrid.material.uniforms.uSize2.value = 8

    postproduction.enabled = true;
    postproduction.customEffects.excludedMeshes.push(worldGrid.three);
    postproduction.setPasses({ custom: true, ao: true, gamma: true })
    postproduction.customEffects.lineColor = 0x17191c

    const highlighter = components.get(OBF.Highlighter)
    if(!highlighter.isSetup)
    {highlighter.setup({ world })}
    highlighter.zoomToSelection = true
    // highlighter.backupColor = new THREE.Color('#A0C3AF')
    // console.log("high light colors",highlighter.colors);
    highlighter.colors.set('hover',new THREE.Color('#3e4396'))
    const resizeWorld = () => {
      world.renderer?.resize();
      world.camera.updateAspect();
    };
    containerRef.addEventListener("resize", resizeWorld);

    return world;
  }
  return undefined;
}



export function SetUpFiberWorld(components: OBC.Components, containerRef: HTMLElement | null | undefined, scene: THREE.Scene, name: string = "Main"): OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer> | undefined {
  // return undefined;  
  if (components && containerRef) {
    console.log("world creating", containerRef)
    const worlds = components.get(OBC.Worlds)
    // const world= worlds.create();
    const world = worlds.create<FiberScene, FiberCamera, OBF.PostproductionRenderer>();
    world.name = name;
    // world.scene = new OBC.SimpleScene(components)
    world.scene = new FiberScene(components, scene)
    const t = new FiberScene(components, scene);
    t.setup();
    world.scene.setup()
    // world.scene.three.background = null;//new THREE.Color('blue')
    world.scene.three.background = new THREE.Color('blue')

    world.renderer = new OBF.PostproductionRenderer(components, containerRef)
    const { postproduction } = world.renderer;
    world.camera = new OBC.OrthoPerspectiveCamera(components)
    world.camera.projection.set('Orthographic');
    world.camera.enabled = true;
    // const directionalLight = new THREE.PointLight( 0xffffff );
    // directionalLight.position.y = 3;
    // directionalLight.position.z = 3;
    // directionalLight.intensity = 1000;
    //world.scene.three.add( directionalLight );
    const worldGrid = components.get(OBC.Grids).create(world)
    worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242)
    worldGrid.material.uniforms.uSize1.value = 2
    worldGrid.material.uniforms.uSize2.value = 8

    postproduction.enabled = true;
    postproduction.customEffects.excludedMeshes.push(worldGrid.three);
    postproduction.setPasses({ custom: true, ao: true, gamma: true })
    postproduction.customEffects.lineColor = 0x17191c

    const highlighter = components.get(OBF.Highlighter)
    highlighter.setup({ world })
    // highlighter.zoomToSelection = true

    return world;
  }
  return undefined;
}

// class FiberPostProductionRenderer extends OBF.PostproductionRenderer {

//   constructor(
//     components: OBC.Components,
//     container: HTMLElement,
//     parameters?: Partial<THREE.WebGLRendererParameters>,
//   ) {
//     super(components, container, parameters);
//     this.onResize.add((size) => this.resizePostproduction(size));

//     this.onWorldChanged.add(() => {
//       if (this.currentWorld) {
//         if (this._postproduction) {
//           this._postproduction.dispose();
//         }
//         this._postproduction = new Postproduction(
//           components,
//           this.three,
//           this.currentWorld,
//         );
//         this.setPostproductionSize();
//       }
//     });
//   }

// constructor (components: OBC.Components, container: HTMLElement,renderer: THREE.PostPro | undefined) {
//   super(components,container);
//   if(renderer)
//     this.three = renderer;
// }


// }

class FiberCamera extends OBC.OrthoPerspectiveCamera {
  constructor(components: OBC.Components, camera: THREE.OrthographicCamera | undefined) {
    super(components);
    if (camera)
      this.three = camera;
  }
}

// class FiberScene extends OBC.BaseScene {
//   three: THREE.Object3D<THREE.Object3DEventMap>;

//   constructor (components: OBC.Components,scene : THREE.Scene | undefined) {
//       super(components);
//       if(scene)
//         this.three = scene;
//       else
//         this.three = new THREE.Scene();
//   }
// }


export interface FiberSceneConfig {
  directionalLight: {
    color: THREE.Color;
    intensity: number;
    position: THREE.Vector3;
  };
  ambientLight: {
    color: THREE.Color;
    intensity: number;
  };
}

/**
 * A basic 3D [scene](https://threejs.org/docs/#api/en/scenes/Scene) to add objects hierarchically, and easily dispose them when you are finished with it.
 */
export class FiberScene extends OBC.SimpleScene {
  constructor(components: OBC.Components, scene: THREE.Scene) {
    super(components);
    if (scene)
      this.three = scene;
    else
      this.three = new THREE.Scene();
    this.three.background = new THREE.Color(0x202932);
  }

}

