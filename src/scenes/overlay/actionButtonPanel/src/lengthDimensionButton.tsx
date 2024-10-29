import { Tooltip, Button, colors, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { ModelCache } from "../../../../bim-components/modelCache";
import { useComponentsContext } from "../../../../context/ComponentsContext";

import * as OBCF from "@thatopen/components-front";
import * as OBC from "@thatopen/components";
import { Icon } from "@iconify/react";

export const LengthDimensionButton = () => {
  const components = useComponentsContext();
  const [world, setWorld] = useState<OBC.World>();
  const [enabled, setEnabled] = useState<boolean>(false);
  const marksRef = useRef<HTMLElement[]>([]); // Store references to the floating marks
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
    dimensions.enabled = true;
    dimensions.snapDistance = 1;
  }, [world]);

  useEffect(() => {
    if (enabled) {
      // Attach keydown listener to the window when enabled
      addEventListenersToMarks();
      window.addEventListener("keydown", handleKeyDown);
    }

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

    if (enabled) {
      components.get(OBCF.LengthMeasurement).cancelCreation();
      removeEventListenersFromMarks();

      // components.get(OBCF.LengthMeasurement).list[0].label.three.element
    }
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
    if(!lengthMeasurement) return;
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
    <>
      <Tooltip
        title={enabled ? "Click Space to start and stop a measurement." : "Click to enable or remove measurements."}
      >
        <Button
          sx={{ backgroundColor: "transparent", color: enabled ? colors.grey[400] : colors.grey[700], border: "0" }}
          onClick={() => toggleDimensions()}
          //   onDoubleClick={handleDoubleClick}
          style={{ border: "0" }}
        >
          <Icon icon="tabler:ruler-measure" />
        </Button>
      </Tooltip>
    </>
  );
};

export default LengthDimensionButton;
