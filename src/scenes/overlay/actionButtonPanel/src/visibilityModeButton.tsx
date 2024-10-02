import { Icon } from "@iconify/react";
import { Tooltip, Button, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";
import { VisibilityMode } from "../../../../utilities/types";

export const VisibilityModeButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>();

  // listen for visibility mode change to reflect correct button icon
  useEffect(() => {
    const viewManager = components?.get(ModelViewManager);
    if (!viewManager) return;

    viewManager.onVisibilityModeChanged.add(handleVisibilityModeChange);
    setVisibilityMode(viewManager.VisibilityMode);
    return () => {
      viewManager.onVisibilityModeChanged.remove(handleVisibilityModeChange);
    };
  }, [components]);

  // set local visibility mode on Event trigger
  const handleVisibilityModeChange = () => {
    const viewManager = components?.get(ModelViewManager);
    if (!viewManager) return;

    viewManager.VisibilityMode;
    setVisibilityMode(viewManager.VisibilityMode);
  };

  // handle visibility mode change from User clicking. set the new state and then update the visibility tree of the ViewManager
  const toggleVisibilityMode = () => {
    const viewManager = components?.get(ModelViewManager);

    if (visibilityMode === VisibilityMode.Isolate) viewManager.VisibilityMode = VisibilityMode.showPrevious;
    else if (visibilityMode === VisibilityMode.showPrevious) viewManager.VisibilityMode = VisibilityMode.Isolate;
    // else if (visibilityMode === VisibilityMode.showNeighbors) viewManager.VisibilityMode = VisibilityMode.Isolate;
    // else if (visibilityMode === VisibilityMode.selectGroup) viewManager.VisibilityMode = VisibilityMode.Isolate;

    setVisibilityMode(viewManager.VisibilityMode);

    if(viewManager?.Tree?.id)
    viewManager.updateBasedOnVisibilityMode(undefined, undefined,viewManager?.Tree?.id);

    console.log("Visibility mode", viewManager.VisibilityMode);
  };

  const getIcon = (mode: VisibilityMode) => {
    switch (mode) {
      case VisibilityMode.Isolate:
        return <Icon icon="tabler:stack" />;
      // case VisibilityMode.selectGroup:
      //   return <Icon icon="tabler:stack-middle" />;
      case VisibilityMode.showPrevious:
        return <Icon icon="tabler:stack-2" />;
      // case VisibilityMode.showNeighbors:
      //   return <Icon icon="tabler:stack-3" />;
      default:
        return <Icon icon="mdi-light:vector-arrange-below" />; // Default icon
    }
  };

  const getToolTip = (mode: VisibilityMode) => {
    switch (mode) {
      case VisibilityMode.Isolate:
        return "Isolate group";
      case VisibilityMode.selectGroup:
        return "Select group";
      case VisibilityMode.showPrevious:
        return "Show Previous";
      case VisibilityMode.showNeighbors:
        return "Show all";
      default:
        return "Default Mode"; // Default icon
    }
  };

  return (
    <Tooltip title={visibilityMode && getToolTip(visibilityMode)}>
      <Button onClick={toggleVisibilityMode} style={{ color: colors.grey[200], border: "0" }} variant={"outlined"}>
        {visibilityMode && getIcon(visibilityMode)}
      </Button>
    </Tooltip>
  );
};

export default VisibilityModeButton;
