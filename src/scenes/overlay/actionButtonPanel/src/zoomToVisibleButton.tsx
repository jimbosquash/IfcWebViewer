import { Icon } from "@iconify/react";
import { Button, Tooltip, useTheme } from "@mui/material";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";
import { zoomToVisible } from "../../../../utilities/CameraUtilities";

export const ZoomToVisibleButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();

  return (
    <>
      <Tooltip title="Zoom to Visible">
        <Button onClick={() => zoomToVisible(components)} style={{ color: colors.grey[200], border: "0" }} variant={"outlined"}>
          <Icon icon="material-symbols:zoom-in-map" />
        </Button>
      </Tooltip>
    </>
  );
};
