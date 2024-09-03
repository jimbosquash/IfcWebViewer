import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { uploadIfcFromUserInput } from "../../utilities/IfcFileLoader";

export const UploadButton = async (components: OBC.Components): Promise<HTMLElement | undefined> => {
    if (!components) return undefined;
  
    const ifcLoader = components.get(OBC.IfcLoader);
    await ifcLoader.setup();

    ifcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

    return BUI.Component.create(() => {
      return BUI.html`
              <bim-button 
              data-ui-id="import-ifc"
              label="Load IFC"
              style="flex: 0;" 
              @click=${() => uploadIfcFromUserInput(components)} 
              icon="mage:box-3d-fill">
            </bim-button>
           `;
    });
  };
