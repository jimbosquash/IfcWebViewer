import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as THREE from "three"
import { useContext, useEffect, useRef, useState } from "react";
import { ModelCache } from "../../../bim-components/modelCache";
import { ComponentsContext } from "../../../context/ComponentsContext";

export const BimSettings = () => {
  const components = useContext(ComponentsContext);
  const panelSection = useRef<HTMLDivElement | null>(null);
  const [isSetUp, setIsSetUp] = useState<boolean>(false);

  useEffect(() => {
    if (!components || isSetUp) return;
    BUI.Manager.init();
    const loader = components.get(OBC.IfcLoader);
    if (loader) {
      loader.onIfcStartedLoading;
    }

    const loadSettingsPanel = async () => {
      const modelloadedSection = asyncGetModelLoadedPanelSection(components);
      const relationsTree = createrelationsTreeComponent(components);
      const uploadButton = await createUploadButton(components);
      const panel = BUI.Component.create(() => {
        // const [loadIfcBtn] = CUI.buttons.loadIfc({ components });

        return BUI.html`
            <bim-panel label="Settings" >
              <bim-panel-section>
                ${uploadButton}
                ${modelloadedSection}
                ${relationsTree}
              </bim-panel-section>
            </bim-panel> 
          `;
      });
      // <bim-panel-section label="Importing">
      // ${modelloadedSection}
      // </bim-panel-section>
      if (panelSection.current && panel) {
        panelSection.current.appendChild(panel);
      }

      setIsSetUp(true);
    };

    loadSettingsPanel();

    return () => {
      if (panelSection.current) {
        panelSection.current.innerHTML = "";
      }
      setIsSetUp(false);
    };
  }, [components]);

  return (
    <>
      <div
        className="BimSettings"
        style={{
          overflow: "auto", // Add scroll if content exceeds dimensions
        }}
        ref={panelSection}
      ></div>
    </>
  );
};

const asyncGetModelLoadedPanelSection = (components: OBC.Components) => {
  if (!components) return;

  const [modelsList] = CUI.tables.modelsList({ components });
  console.log("setting up ifc property panel", modelsList);

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
    <bim-panel-section label="Model List">
    ${modelsList}
    </bim-panel-section>
    `;
  });
};

const createrelationsTreeComponent = (components: OBC.Components): HTMLElement | undefined => {
  if (!components) return;
  const fragmentsManager = components.get(OBC.FragmentsManager);
  const indexer = components.get(OBC.IfcRelationsIndexer);

  fragmentsManager.onFragmentsLoaded.add(async (model) => {
    if (model.hasProperties) await indexer.process(model);
  });

  const [relationsTree] = CUI.tables.relationsTree({
    components,
    models: [],
  });

  relationsTree.preserveStructureOnFilter = true;

  const panel = BUI.Component.create(() => {
    const onSearch = (e: Event) => {
      const input = e.target as BUI.TextInput;
      relationsTree.queryString = input.value;
    };

    return BUI.html`
           <bim-panel-section label="Model Tree">
             <bim-text-input @input=${onSearch} placeholder="Search..." debounce="200"></bim-text-input>
             ${relationsTree}
           </bim-panel-section>
         `;
  });

  return panel;
};

const createUploadButton = async (components: OBC.Components): Promise<HTMLElement | undefined> => {
  if (!components) return undefined;

  const ifcLoader = components.get(OBC.IfcLoader);
  const manager = components.get(OBC.FragmentsManager);
  // manager.onFragmentsLoaded.add((data) => console.log("model set up", data))
  const modelCache = components.get(ModelCache);
  await ifcLoader.setup();
  ifcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

  const onBtnClick = () => {
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

  return BUI.Component.create(() => {
    return BUI.html`
            <bim-button 
            data-ui-id="import-ifc"
            label="Load IFC"
            style="flex: 0;" 
            @click=${onBtnClick} 
            icon="mage:box-3d-fill">
          </bim-button>
         `;
  });
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

          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(oldColor[0], oldColor[1], oldColor[2]),
            side: THREE.DoubleSide
          });

          child.material = material;
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
