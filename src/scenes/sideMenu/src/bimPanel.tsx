import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import { useEffect, useRef } from "react";


export const StatefullPanelSection : React.FC = () => {
  const panelSection = useRef<HTMLDivElement | null>(null)
  // const statelessPanelSection = useRef<HTMLDivElement | null>(null)
  
  let counter = 0;
  const onUpdateBtnClick = () => {
    counter++;
    if (counter >= 5) {
      updateStatefullPanelSection({
        label: "Powered Statefull Panel Section 💪",
        counter,
      });
    } else {
      updateStatefullPanelSection({ counter });
    }
  };

  useEffect(() => {
      const stateFullpanel = BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html`
        <bim-panel label="My Panel">
          <bim-panel-section label="Update Functions">
            <bim-button @click=${onUpdateBtnClick} label="Update Statefull Section"></bim-button>
          </bim-panel-section>
          ${statefullPanelSection}
        </bim-panel>
      `;
    });

      if(panelSection.current) {
          panelSection.current.appendChild(stateFullpanel)
      }

      return () => {
        if(panelSection.current) {
          panelSection.current.innerHTML = ''
        }
      }
  },[])

  return (<div ref={panelSection}></div>)
  
}

  export const StatelessPanelSection : React.FC = () => {

    const panelSection = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const panel = BUI.Component.create<BUI.PanelSection>(() => {
            return BUI.html`
            <bim-panel-section label="Stateless Panel Section">
              <bim-color-input label="Color"></bim-color-input>
            </bim-panel-section>
          `;
        });

        if(panelSection.current) {
            panelSection.current.appendChild(panel)
        }

        return () => {
          if(panelSection.current) {
            panelSection.current.innerHTML = ''
          }
        }
    },[])

    return (<div ref={panelSection}></div>)
    
}

interface PanelSectionUIState {
  label: string;
  counter: number;
}

const [statefullPanelSection, updateStatefullPanelSection] =
  BUI.Component.create<BUI.PanelSection, PanelSectionUIState>(
    (state: PanelSectionUIState) => {
      const { label, counter } = state;
      const msg = `This panel section has been updated ${counter} ${counter === 1 ? "time" : "times"}`;
      return BUI.html`
      <bim-panel-section label=${label}>
        <bim-label>${msg}</bim-label>
      </bim-panel-section>
    `;
    },
    { label: "Statefull Panel Section", counter: 0 },
  );




export default StatelessPanelSection;