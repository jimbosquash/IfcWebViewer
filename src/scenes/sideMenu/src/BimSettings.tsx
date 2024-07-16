import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import { useContext, useEffect, useRef, useState } from "react";
import { ComponentsContext } from "../../../context/ComponentsContext";
// import { useEffect, useRef } from "react";

export const BimSettings = () => {
    const components = useContext(ComponentsContext);
    const panelSection = useRef<HTMLDivElement | null>(null);
    const [isSetUp, setIsSetUp] = useState<boolean>(false);
    const [dimensions, setDimensions] = useState({ width: '200px', height: '300px' });



  
    useEffect(() => {
      if (!components || isSetUp) return;
  
    //   console.log("is set up", isSetUp);

    const loader = components.get(OBC.IfcLoader);
    if(loader)
    {
      loader.onIfcStartedLoading 
    }
  
      const loadSettingsPanel = () => {
        // const modelloadedSection = asyncGetModelLoadedPanelSection(components);
  
        const panel = BUI.Component.create(() => {
          const [loadIfcBtn] = CUI.buttons.loadIfc({ components });

          return BUI.html`
            <bim-panel label="Settings" >
            <bim-panel-section label="Importing">
      ${loadIfcBtn}
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

  //   useEffect(() => {
  //     const updateDimensions = () => {
  //         // You can adjust this logic to set dimensions based on parent container or window size
  //         setDimensions({
  //             width: `${window.innerWidth * 0.2}px`,  // 20% of window width
  //             height: `${window.innerHeight * 0.8}px` // 80% of window height
  //         });
  //     };

  //     updateDimensions();
  //     window.addEventListener('resize', updateDimensions);

  //     return () => window.removeEventListener('resize', updateDimensions);
  // }, []);


  
    return (
      <div 
            className="BimSettings" 
            style={{
                width: dimensions.width, 
                height: dimensions.height,
                overflow: 'auto'  // Add scroll if content exceeds dimensions
            }} 
            ref={panelSection}
        ></div>
    );
  };

const asyncGetModelLoadedPanelSection = (components: OBC.Components) => {
  if (!components) return;

  const ifcLoader = components.get(OBC.IfcLoader);

  const [modelsList] = CUI.tables.modelsList({ components });
  console.log('setting up ifc property panel',modelsList)


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
