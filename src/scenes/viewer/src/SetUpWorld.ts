import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import * as THREE from 'three';
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";

export function SetUpWorld(components: OBC.Components, containerRef: HTMLElement | null | undefined, name: string): OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer> | undefined {
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
    const light = new THREE.AmbientLight(0x424242, 30)
    world.scene.three.add(light);
    BUI.Manager.init();
    CUI.Manager.init();
    // const viewCube = document.createElement("bim-view-cube");
    
    // viewCube.frontText = "Front";
    // viewCube.topText = "Top";
    // viewCube.backText = "Back";
    // viewCube.leftText = "Left";
    // viewCube.rightText = "Right";
    // viewCube.size = 120;
    // viewCube.camera = world.camera.three;
    // // TODO: when camera changes, between ortho and pers then change the view cubes cam too
    // containerRef.append(viewCube);

    // world.camera.controls.addEventListener("update", () => viewCube.updateOrientation());

    const worldGrid = components.get(OBC.Grids).create(world)
    worldGrid.fade= true;
    worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242)
    worldGrid.material.uniforms.uSize1.value = 1
    worldGrid.material.uniforms.uSize2.value = 5

    postproduction.enabled = true;

    postproduction.customEffects.excludedMeshes.push(worldGrid.three);
    postproduction.setPasses({ custom: true, ao: true, gamma: true })
    postproduction.customEffects.lineColor = 0x17191c

    const highlighter = components.get(OBF.Highlighter)
    if (!highlighter.isSetup) { highlighter.setup({ world }) }
    highlighter.zoomToSelection = true
    highlighter.colors.set('hover', new THREE.Color('#6870fa'))
    const selectColor = highlighter.colors.get("select");
    if (selectColor) {
      highlighter.add("ActiveGroupSelection", selectColor);
      console.log("high light colors", highlighter.colors);

    }

    const resizeWorld = () => {
      world.renderer?.resize();
      world.camera.updateAspect();
    };
    containerRef.addEventListener("resize", resizeWorld);

    // tring to user helper from three examples (look for einteractive example)
    // const helper = new ViewHelper(world.camera.three, world.renderer.three.domElement);
    // world.scene.three.add(helper);


    return world;
  }
  return undefined;
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

