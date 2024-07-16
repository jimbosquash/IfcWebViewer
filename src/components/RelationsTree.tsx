import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import { useContext, useEffect, useRef } from "react";
import { ComponentsContext } from "../context/ComponentsContext";
import { useModelContext } from "../context/ModelStateContext";

export const RelationsTree : React.FC = () => {
  const components = useContext(ComponentsContext);
  const { currentWorld } = useModelContext();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    //generate new tree to the world

    if (!currentWorld || !containerRef.current) return;

    const panel = createrelationsTreeComponent();
    console.log("relations tree", panel)
    if (containerRef.current && panel) {
      containerRef.current.appendChild(panel);
    }
  }, [currentWorld]);

  const createrelationsTreeComponent = (): HTMLElement | undefined => {
    if (!components || !currentWorld) return;
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
            <bim-panel label="Classifications Tree">
             <bim-panel-section label="Classifications">
               <bim-text-input @input=${onSearch} placeholder="Search..." debounce="200"></bim-text-input>
               ${relationsTree}
             </bim-panel-section>
            </bim-panel> 
           `;
    });

    return panel;
  };

  return <div ref={containerRef}></div>;
};
