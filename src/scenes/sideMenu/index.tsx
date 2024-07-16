import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { ComponentsContext } from "../../context/ComponentsContext";
import { StatefullPanelSection } from "./src/bimPanel"
import { BimSettings } from "./src/BimSettings"
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";

interface sideBarProps {
    isVisible: boolean;
}

export const SideMenu : React.FC<sideBarProps> = ({isVisible}) => {


    return(
        <div className="sideMenu"
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: "100vh",
            margin: '0 auto',
            width: '100%',
          }}>
        {isVisible && <BimSettings/>}
        </div>
    )
}



const BimPanel: React.FC = () => {
const containerRef = useRef<HTMLDivElement | null>(null);
const components = useContext(ComponentsContext);

useLayoutEffect(() => {
    BUI.Manager.init();
        if (!customElements.get('bim-panel')) {
            console.warn('bim-panel is not defined yet');
            return;
        }
    const htmlElement = createPanel();
    if(htmlElement && containerRef.current)
    {
        containerRef.current.appendChild(htmlElement);
        console.log('panel appended:', containerRef.current.innerHTML)

    }

    return () => {
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }
    }
}, [components])


const createPanel = () : HTMLElement | undefined => {
    if(!components) {return}
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

      return panel;
}



return(<>
<h1>Bim panel header</h1>
<div style={{display: "flex", width: "100%", height: "100vh"}} ref={containerRef}>

</div>
</>)
}

