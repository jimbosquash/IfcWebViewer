import { useRef, useContext, useEffect, useState } from "react";
import { ComponentsContext } from "../../context/ComponentsContext";
import { ModelStateContext } from "../../context/ModelStateContext";
import * as BUI from "@thatopen/ui";
import { SetUpWorld } from "./src/SetUpWorld";



export const WebComponentViewer = () => {
    const containerRef = useRef<HTMLDivElement>(null);
  const components = useContext(ComponentsContext);
  const modelContext = useContext(ModelStateContext);
  const [isSetUp, setIsSetUp] = useState<boolean>(false);

  useEffect(() => {
    if(isSetUp || !components)
        return;

        BUI.Manager.init();

        const viewport = BUI.Component.create<BUI.Viewport>(() => {
            return BUI.html`
              <bim-viewport>
                <bim-grid floating></bim-grid>
              </bim-viewport>
            `;
          });

          const newWorld = SetUpWorld(components,viewport,"Main")

          if (containerRef.current && viewport) {
            containerRef.current.appendChild(viewport);
          }
          setIsSetUp(true);
  
      return () => {
        if (containerRef.current) {
            containerRef.current.innerHTML = "";
        }
        setIsSetUp(false);
      };
  }
  
  
  ,[])

  return(
    <>
      <div  style={{width:"100%", height:"100%"}} ref={containerRef}>
    </div>
</>
  )


}