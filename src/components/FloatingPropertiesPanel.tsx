import { useTheme } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { ComponentsContext } from "../context/ComponentsContext";
import { tokens } from "../theme";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";

export const FloatingPropertiesPanel: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useContext(ComponentsContext);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSetUp, setUp] = useState<boolean>(false);

  useEffect(() => {
    if (!components || isSetUp) return;
    BUI.Manager.init();

    const [propertiesTable, updatePropertiesTable] = CUI.tables.elementProperties({
      components,
      fragmentIdMap: {},
    });

    const highlighter = components?.get(OBF.Highlighter);
    console.log("property panel adding events");

    highlighter.events.select.onHighlight.add((fragmentIdMap) => updatePropertiesTable({ fragmentIdMap }));
    highlighter.events.select.onHighlight.add((fragmentIdMap) => console.log("highlight change", fragmentIdMap));
    highlighter.events.select.onClear.add(() => updatePropertiesTable({ fragmentIdMap: {} }));

    const propertiesPanel = BUI.Component.create(() => {
      const onTextInput = (e: Event) => {
        console.log("prop panel search", propertiesTable);

        const input = e.target as BUI.TextInput;
        propertiesTable.queryString = input.value !== "" ? input.value : null;
      };

      const expandTable = (e: Event) => {
        const button = e.target as BUI.Button;
        console.log("prop panel exapnding", propertiesTable);
        propertiesTable.expanded = !propertiesTable.expanded;
        button.label = propertiesTable.expanded ? "Collapse" : "Expand";
      };

      const copyAsTSV = async () => {
        await navigator.clipboard.writeText(propertiesTable.tsv);
      };

      return BUI.html`
        <bim-panel label="Properties">
        <bim-panel-section label="Element Data">
            <div style="display: flex; gap: 0.5rem;">
            <bim-button @click=${expandTable} label=${propertiesTable.expanded ? "Collapse" : "Expand"}></bim-button> 
            <bim-button @click=${copyAsTSV} label="Copy as CSV"></bim-button> 
            </div> 
            <bim-text-input @input=${onTextInput} placeholder="Search Property" debounce="250"></bim-text-input>
            ${propertiesTable}
        </bim-panel-section>
        </bim-panel>
        `;
    });

    if (propertiesPanel && containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(propertiesPanel);
    }

    setUp(true);

    return () => {
      //unhook event
      console.log("property panel removing events");
      //   highlighter.events.select.onClear.remove(() => updatePropertiesTable({ fragmentIdMap: {} }));
      //   highlighter.events.select.onHighlight.remove((fragmentIdMap) => updatePropertiesTable({ fragmentIdMap }));
      //   highlighter.events.select.onHighlight.remove((fragmentIdMap) => console.log( "highlight change",fragmentIdMap ));
    };
  }, [components]);

  return (
    <>
      <div
        className="draggable-panel"
        style={{
          position: "fixed",
          margin: "10px",
          top: "10%",
          right: 0,
        //   transform: "translateY(-50%)",
          zIndex: 500,
          padding: "5px",
          width: 350,
          maxHeight: "70vh",
          overflow: "auto",
          // border: '1px solid #ccc'
        }}
      >
        <div ref={containerRef}></div>
      </div>
    </>
  );
};
