import * as OBC from "@thatopen/components";
import { Components } from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import { useContext, useEffect, useRef, useState } from "react";
import { ComponentsContext } from "../../../context/ComponentsContext";
// import { useEffect, useRef } from "react";

export const BimSettings = () => {
    const components = useContext(ComponentsContext);
    const panelSection = useRef<HTMLDivElement | null>(null);
    const [isSetUp, setIsSetUp] = useState<boolean>(false);
  
    useEffect(() => {
      if (!components || isSetUp) return;
  
    //   console.log("is set up", isSetUp);
  
      const loadSettingsPanel = () => {
        const modelloadedSection = asyncGetModelLoadedPanelSection(components);
  
        const panel = BUI.Component.create(() => {
          return BUI.html`
            <bim-panel label="Settings" >
              ${modelloadedSection}
            </bim-panel> 
          `;
        });
  
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
    }, []);
  
    return <div ref={panelSection}></div>;
  };

const asyncGetModelLoadedPanelSection = (components: OBC.Components) => {
  if (!components) return;

  const ifcLoader = components.get(OBC.IfcLoader);
  //await ifcLoader.setup();

  const [modelsList] = CUI.tables.modelsList({ components });

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
    <bim-panel-section label="Model List">
    ${modelsList}
    </bim-panel-section>
    `;
  });
};

const GetBimPanelSectionTest = (components: OBC.Components) => {
  if (!components) return;

  const [classificationsTree, updateClassificationsTree] =
    CUI.tables.classificationTree({
      components,
      classifications: {},
    });

  const classifier = components?.get(OBC.Classifier);
  const fragmentsManager = components?.get(OBC.FragmentsManager);

  fragmentsManager?.onFragmentsLoaded.add(async (model) => {
    classifier?.byEntity(model);

    await classifier?.byPredefinedType(model);
    const classifications = {
      Entities: ["entities"],
      "Predefined Types": ["predefinedTypes"],
    };

    updateClassificationsTree({ classifications });
  });

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
<bim-panel-section label="Classifications">
${classificationsTree}
</bim-panel-section>
`;
  });
};
