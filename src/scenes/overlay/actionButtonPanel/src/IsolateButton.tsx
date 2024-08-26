import { Button, Tooltip, useTheme } from "@mui/material";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";
import { Icon } from "@iconify/react";

export const IsolateButton = () => {
  const components = useComponentsContext();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  function IsolateSelected(): void {
    const highlighter = components.get(OBF.Highlighter);
    const hider = components.get(OBC.Hider);
    const selected = highlighter.selection;
    if (!selected) return;
    Object.keys(selected).forEach((selectionID) => {
      if (selectionID !== "select") return;
      const fragmentIdMap = selected[selectionID];
      console.log(`Selection ID: ${selectionID}, FragmentIdMap:`, fragmentIdMap);
      hider.isolate(fragmentIdMap);
    });
  }

  return (
    <>
      <Tooltip title="Isolate Selected">
        <Button
          sx={{ backgroundColor: "transparent" }}
          onClick={() => IsolateSelected()}
          style={{ color: colors.grey[400], border: "0" }}
        >
          <Icon icon="mdi:eye-off-outline" />{" "}
        </Button>
      </Tooltip>
    </>
  );
};
