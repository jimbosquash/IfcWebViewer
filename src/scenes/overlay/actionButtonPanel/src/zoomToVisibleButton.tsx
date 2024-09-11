import { Icon } from "@iconify/react";
import { Button, Tooltip, useTheme } from "@mui/material";
import { ModelCache } from "../../../../bim-components/modelCache";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";
import { zoomToBuildingElements } from "../../../../utilities/BuildingElementUtilities";
import { GetAllVisibleExpressIDs } from "../../../../utilities/IfcUtilities";
import { BuildingElement } from "../../../../utilities/types";

export const ZoomToVisibleButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const zoom = () => {

    const cache = components.get(ModelCache);

    const visibleExpressIDs = GetAllVisibleExpressIDs(cache.models());

    const visibleElements: BuildingElement[] = [];
    visibleExpressIDs.forEach((expressIDs,modelID) => {
      expressIDs.forEach(expressID => { 
        const e = cache.getElementByExpressId(expressID,modelID);
        if(e) visibleElements.push(e)})
    })
    zoomToBuildingElements(visibleElements,components,false)
  };

  return (
    <>
      <Tooltip title="Zoom to Visible">
        <Button onClick={zoom} style={{ color: colors.grey[200], border: "0" }} variant={"outlined"}>
          <Icon icon="material-symbols:zoom-in-map" />
        </Button>
      </Tooltip>
    </>
  );
};
