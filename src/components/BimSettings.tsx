import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import { useEffect, useRef, useState } from "react";
import { useComponentsContext } from "../context/ComponentsContext";
import { UploadButton } from "../bim-components/src/uploadButton";

export const BimSettings = () => {
  const components = useComponentsContext();
  const panelSection = useRef<HTMLDivElement | null>(null);
  const [isSetUp, setIsSetUp] = useState<boolean>(false);

  useEffect(() => {
    if (!components || isSetUp) return;
    BUI.Manager.init();

    loadSettingsPanel(components);

    return () => {
      if (panelSection.current) {
        panelSection.current.innerHTML = "";
      }
      setIsSetUp(false);
    };
  }, [components]);

  const loadSettingsPanel = async (components: OBC.Components) => {
    if (!components) return;
    const modelloadedSection = asyncGetModelLoadedPanelSection(components);
    const relationsTree = createrelationsTreeComponent(components);
    const uploadButton = await UploadButton(components);
    const panel = BUI.Component.create(() => {
      return BUI.html`
          <bim-panel label="Settings" >
            <bim-panel-section>
              ${uploadButton}
              ${modelloadedSection}
            </bim-panel-section>
          </bim-panel> 
        `;
    });
    if (panelSection.current && panel) {
      panelSection.current.replaceChildren(panel);
    }

    setIsSetUp(true);
  };

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
