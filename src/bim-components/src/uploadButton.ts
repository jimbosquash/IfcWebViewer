import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";
import * as BUI from "@thatopen/ui";
import * as THREE from "three"
import { ModelCache } from "../modelCache";

export const UploadButton = async (components: OBC.Components): Promise<HTMLElement | undefined> => {
    if (!components) return undefined;
  
    const ifcLoader = components.get(OBC.IfcLoader);
    const modelCache = components.get(ModelCache);
    await ifcLoader.setup();

    ifcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

  
    return BUI.Component.create(() => {
      return BUI.html`
              <bim-button 
              data-ui-id="import-ifc"
              label="Load IFC"
              style="flex: 0;" 
              @click=${() => uploadIfcFromUserInput(ifcLoader,modelCache)} 
              icon="mage:box-3d-fill">
            </bim-button>
           `;
    });
  };


  export const uploadIfcFromUserInput = (ifcLoader : OBC.IfcLoader, modelCache : ModelCache) => {
    console.log("upoade button clicked", ifcLoader,modelCache)
    const fileOpener = document.createElement("input");
    fileOpener.type = "file";
    fileOpener.accept = ".ifc";
    fileOpener.onchange = async () => {
      if (fileOpener.files === null || fileOpener.files.length === 0) return;
      const file = fileOpener.files[0];
      fileOpener.remove();
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const model = await ifcLoader.load(data);
      model.name = file.name.replace(".ifc", "");
      setMeshFaceDoubleSided(model)
      modelCache.add(model)
    };
    fileOpener.click();
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