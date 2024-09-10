import { Icon } from "@iconify/react";
import { Button, Tooltip, useTheme } from "@mui/material";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";

export const ZoomToVisibleButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const zoom = () => {};

  return (
    <>
      <Tooltip title={"Navigate Building Steps"}>
        <Button onClick={zoom} style={{ color: colors.grey[200], border: "0" }} variant={"outlined"}>
          <Icon icon="material-symbols:zoom-in-map" />
        </Button>
      </Tooltip>
    </>
  );
};
