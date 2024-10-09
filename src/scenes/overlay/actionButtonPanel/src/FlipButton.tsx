import { Icon } from "@iconify/react";
import { Button, Tooltip, useTheme } from "@mui/material";
import { useState } from "react";
import { ModelCache } from "../../../../bim-components/modelCache";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";
import { TreeNode } from "../../../../utilities/Tree";
import { TreeUtils } from "../../../../utilities/treeUtils";
import { BuildingElement, SelectionGroup } from "../../../../utilities/types";

export const FlipButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [groupType, setGroupType] = useState<string>();

  const toggleGroupType = () => {
    //get current selected node



    // if child is not type building element then set its first child as the selected group

    const cache = components.get(ModelCache);
    cache.startRotationAnimation();
  };


  return (
    <>
      <Tooltip title={`Navigate ${groupType}`}>
        <Button onClick={toggleGroupType} style={{ color: colors.grey[200], border: "0" }} variant={"outlined"}>
          {<Icon icon="vaadin:flip-v" />}
        </Button>
      </Tooltip>
    </>
  );
};

export default FlipButton;
