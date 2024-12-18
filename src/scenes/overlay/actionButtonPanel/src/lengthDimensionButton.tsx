import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { ModelCache } from "../../../../bim-components/modelCache";
import { useComponentsContext } from "../../../../context/ComponentsContext";

import * as OBCF from "@thatopen/components-front";
import * as OBC from "@thatopen/components";
import { Icon } from "@iconify/react";
import { ToolBarButton } from "./toolbarButton";

export const LengthDimensionButton = () => {
  const components = useComponentsContext();
  const [world, setWorld] = useState<OBC.World>();
  const [enabled, setEnabled] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false); // Control visibility of the overlay

  const drwStarted = useRef<boolean>(false); // Store references to the floating marks

  // add listeners for changing world
  useEffect(() => {
    if (!components) return;

    const modelCache = components.get(ModelCache);
    modelCache.onWorldSet.add((data) => setWorld(data));

    return () => {
      modelCache?.onWorldSet.remove((data) => setWorld(data));
    };
  }, [components]);

  // set up model tagger
  useEffect(() => {
    if (!components) return;

    const dimensions = components.get(OBCF.LengthMeasurement);
    if (!world) {
      dimensions.enabled = false;
      return;
    }

    dimensions.world = world;
    dimensions.enabled = false;
    dimensions.snapDistance = 1;
  }, [world]);

  useEffect(() => {
    if (enabled) {
      // Attach keydown listener to the window when enabled
      addEventListenersToMarks();
      window.addEventListener("keydown", handleKeyDown);
    }
    setShowInstructions(enabled)


    return () => {
      // Clean up keydown listener when disabled or on unmount
      removeEventListenersFromMarks();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (enabled && event.code === "Space") {
      event.preventDefault(); // Prevent default browser behavior (e.g., page scrolling)
      console.log("Space bar pressed!");
      components.get(OBCF.LengthMeasurement).create();
      if (drwStarted.current) {
        // finish draw now
        // add to listeners
        removeEventListenersFromMarks();
        addEventListenersToMarks();
      }
      drwStarted.current = !drwStarted.current;
    }
    if (enabled && event.code === "Escape") {
      event.preventDefault(); // Prevent default browser behavior (e.g., page scrolling)
      console.log("esc bar pressed!");
      components.get(OBCF.LengthMeasurement).cancelCreation();
    }
  };

  const toggleDimensions = async () => {
    if (!components) return;

    components.get(OBCF.LengthMeasurement).enabled = !enabled;
    setEnabled(!enabled);

    components.get(OBCF.LengthMeasurement).visible = !enabled;
  };

  const handleMouseOver = (event: MouseEvent, mark: HTMLElement) => {
    console.log("Mouse over mark!");

    if (enabled) {
      console.log("Mouse over mark!");
      mark.style.backgroundColor = "red"; // Change color on hover
    }
  };

  const handleMouseOut = (event: MouseEvent, dim: HTMLElement) => {
    dim.style.backgroundColor = "black"; // Reset color on mouse out
  };

  const handleDoubleClickMark = async (dim: OBCF.SimpleDimensionLine) => {
    try {
      console.log("Double-click on mark detected, deleting...");

      // Await the deletion process
      await components.get(OBCF.LengthMeasurement).deleteMeasurement(dim);

      console.log("Measurement deleted successfully.");
    } catch (error) {
      console.error("Failed to delete measurement:", error);
    }
  };

  const addEventListenersToMarks = () => {
    const lengthMeasurement = components.get(OBCF.LengthMeasurement);
    console.log("Adding event listeners to marks:", lengthMeasurement.list);

    lengthMeasurement.list.forEach((dim) => {
      const element = dim.label.three.element;
      if (element) {
        console.log("Adding listeners to element:", element);
        element.style.pointerEvents = "auto";

        element.addEventListener("dblclick", () => handleDoubleClickMark(dim));
        element.addEventListener("mouseover", (event) => handleMouseOver(event, element));
        element.addEventListener("mouseout", (event) => handleMouseOut(event, element));
      } else {
        console.warn("Element not found for dimension:", dim);
      }
    });
  };

  const removeEventListenersFromMarks = () => {
    const lengthMeasurement = components?.get(OBCF.LengthMeasurement);
    if (!lengthMeasurement) return;
    lengthMeasurement.list?.forEach((dim) => {
      const element = dim.label.three.element;
      if (element) {
        element.style.pointerEvents = "none";

        element.removeEventListener("dblclick", () => handleDoubleClickMark(dim));
        element.removeEventListener("mouseover", (event) => handleMouseOver(event, element));
        element.addEventListener("mouseout", (event) => handleMouseOut(event, element));
      }
    });
  };

  return (
    <><ToolBarButton toolTip={enabled ? "Disable measurement" : "Enable measurements"}
      onClick={() => toggleDimensions()}
      content={<Icon icon="tabler:ruler-measure" />} />

      {/* Instructions Overlay */}
      {showInstructions && (
        <Box
          component="div"
          sx={{
            position: "absolute",
            bottom: "150%",
            left: "50%",
            transform: "translateX(-50%)",
            mt: -2,
            p: 2,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            borderRadius: 2,
            pointerEvents: "auto", // Allow pointer events for the close button
            zIndex: 1,
            maxWidth: 400,
            textAlign: "center",
            boxShadow: 3, // Add shadow for better visibility
          }}
        >
          <Box component='div' sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box component='div' sx={{ display: "flex", flexDirection: 'row', justifyContent: "flex-end" }}>
              <Typography variant="h6" gutterBottom>
                Dimension Tool Instructions
              </Typography>
              <Icon fontSize={'small'} onClick={() => setShowInstructions(false)} icon="material-symbols:close" />
            </Box>

          </Box>

          <Typography variant="body1">
            - Press <b>Space</b> to start or stop a dimension.
          </Typography>
          <Typography variant="body1">
            - Press <b>Esc</b> to cancel the current dimension.
          </Typography>
          <Typography variant="body1">
            - Double-click a dimension to <b>delete</b> it.
          </Typography>
        </Box>
      )}
    </>
  );
};

export default LengthDimensionButton;
