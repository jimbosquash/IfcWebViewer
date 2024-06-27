import { ThreeDRotation } from "@mui/icons-material";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import * as THREE from 'three';


export function SetUpWorld(components: OBC.Components, containerRef: HTMLElement | null | undefined , name: string = "Main") : OBC.SimpleWorld<OBC.SimpleScene,OBC.OrthoPerspectiveCamera,OBF.PostproductionRenderer> | undefined {
    if(components && containerRef)
    {
      const worlds = components.get(OBC.Worlds)     
      const world= worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>();
      world.name = name;
      world.scene = new OBC.SimpleScene(components)
      world.scene.setup()
      world.scene.three.background = null;//new THREE.Color('blue')
      
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
  