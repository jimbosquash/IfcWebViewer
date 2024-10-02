import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import * as THREE from 'three';
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import { ConfigurationManager } from "../../../bim-components/configManager";


export function SetUpWorld(components: OBC.Components, containerRef: HTMLElement | null | undefined, name: string): OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer> | undefined {
  if (!components || !containerRef) return undefined;

  console.log("world creating", containerRef)
  const worlds = components.get(OBC.Worlds)
  const world = worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>();
  world.name = name;
  world.scene = new OBC.SimpleScene(components)
  world.scene.three
  world.scene.setup()
  world.scene.three.background = null;

  world.renderer = new OBF.PostproductionRenderer(components, containerRef)
  const { postproduction } = world.renderer;

  world.camera = new OBC.OrthoPerspectiveCamera(components)
  components.get(ConfigurationManager).camConfig.get('projection')

  world.camera.projection.set(components.get(ConfigurationManager).camConfig.get('projection'));
  world.camera.enabled = true;
  const light = new THREE.AmbientLight(0x424242, 30)
  world.scene.three.add(light);
  BUI.Manager.init();
  CUI.Manager.init();

  console.log('controls',world.camera.controls);

  const worldGrid = components.get(OBC.Grids).create(world)
  worldGrid.fade = true;
  worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242)
  worldGrid.material.uniforms.uSize1.value = 1
  worldGrid.material.uniforms.uSize2.value = 5

  postproduction.enabled = true;
  postproduction.customEffects.excludedMeshes.push(worldGrid.three);
  postproduction.setPasses({ custom: true, ao: true, gamma: true })
  postproduction.customEffects.lineColor = 0x17191c

  const configManager = components.get(ConfigurationManager)

  worldGrid.visible = configManager.sceneConfig.get('showGrid');

  const highlighter = components.get(OBF.Highlighter)
  if (!highlighter.isSetup) { highlighter.setup({ world }) }
  highlighter.zoomToSelection = configManager.sceneConfig.get('zoomToSelection');
  highlighter.colors.set('hover', new THREE.Color('#6870fa'))
  const selectColor = highlighter.colors.get("select");
  if (selectColor) {
    highlighter.add("ActiveGroupSelection", selectColor);
    console.log("high light colors", highlighter.colors);
  }

  return world;

}