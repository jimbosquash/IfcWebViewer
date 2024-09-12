import * as OBC from "@thatopen/components";
import { ModelCache } from "../bim-components/modelCache";
import { FragmentsGroup } from "@thatopen/fragments";
import * as THREE from "three"

/**
 * handles the opening of an .ifc file and then adds it to the ModelCache for processing.
 * @param file 
 * @param components 
 * @returns 
 */
export const uploadFile = async (file: File, components: OBC.Components, addToCache: boolean): Promise<FragmentsGroup | undefined>  => {
    if(!components) return
    const ifcLoader = components.get(OBC.IfcLoader);
    const modelCache = components.get(ModelCache);
    if(!ifcLoader || !modelCache) return;
    await ifcLoader.setup();

    ifcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
    ifcLoader.settings.webIfc.CIRCLE_SEGMENTS = 5;
    console.log("uploading ifc file", ifcLoader, modelCache)
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const model = await ifcLoader.load(data);
    model.name = file.name.replace(".ifc", "");
    setMeshFaceDoubleSided(model)
    if(addToCache){
    modelCache.add(model, data);}
    return model;
};

 
const setMeshFaceDoubleSided = (model: FragmentsGroup): void => {
    if (!model || !model.children) {
      console.warn('Invalid model or model has no children');
      return;
    }
  
    try {
      for (let i = 0; i < model.children.length; i++) {
        const child = model.children[i];
  
        if (child instanceof THREE.InstancedMesh) {
          if (child.instanceColor !== null) {
            const oldColor = child.instanceColor.array;
            
            if (oldColor.length < 3) {
              console.warn(`Invalid color data for child ${i}`);
              continue;
            }
            // console.log("material type:",child.material);
            let mat = child.material as THREE.MeshLambertMaterial;
            mat.side = THREE.DoubleSide;

            // const material = new THREE.MeshStandardMaterial({
            //   color: new THREE.Color(oldColor[0], oldColor[1], oldColor[2]),
            //   side: THREE.DoubleSide
            // });
  
            // child.material = material;
          } else {
            console.warn(`Child ${i} has no instance color`);
          }
        } else {
          console.log(`Child ${i} is not an InstancedMesh`);
        }
      }
    } catch (error) {
      console.error('Error in setMeshFaceDoubleSided:', error);
    }
  };

  
  export const uploadIfcFromUserInput = (components: OBC.Components) => {
    const fileOpener = document.createElement("input");
    fileOpener.type = "file";
    fileOpener.accept = ".ifc";
    fileOpener.onchange = async () => {
      if (fileOpener.files === null || fileOpener.files.length === 0) return;
      const file = fileOpener.files[0];
      fileOpener.remove();
      uploadFile(file,components,true);
    };
    fileOpener.click();
  };
  
