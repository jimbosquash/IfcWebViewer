import { Box, IconButton, Tooltip, useTheme, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../../theme";
import { useEffect, useRef, useState } from "react";
import * as OBF from "@thatopen/components-front";
import PropertiesPanel from "./src/propertyPanel";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { ModelCache } from "../../../bim-components/modelCache";

export interface SidePanelProps {
  onWidthChange: (width: number) => void;
}
export const sidebarWidth = 52;

export const RightSidePanel: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(250); // Initial width of the panel
  const [isResizing, setIsResizing] = useState(false);
  const [autoOpen, setAutoOpen] = useState(true);
  const [totalWidth, setTotalWidth] = useState(sidebarWidth);
  const [panelContent, setPanelContent] = useState<{ content: JSX.Element | null; name: string }>({
    content: null,
    name: "",
  });

  useEffect(() => {
    setTotalWidth(panelOpen ? panelWidth + sidebarWidth : sidebarWidth);
  }, [panelWidth]);

  useEffect(() => {
    if (!components) return;
    const cache = components.get(ModelCache);
    console.log("side panel listening");

    //cache.onModelAdded.add(() => listenForModels());

    return () => {
      //cache.onModelAdded.remove(() => listenForModels());
      console.log("side panel stop listening");
    };
  }, [components]);

  const listenForModels = () => {
    console.log("right panel listening for highlight");
    if (!autoOpen) return;
    handleIconClick(propertiesPanel(), "overView");
    setAutoOpen(false);
  };

  // Start the resizing
  const handleMouseDown = (e: React.MouseEvent) => setIsResizing(true);
  // Stop the resizing
  const handleMouseUp = () => setIsResizing(false);

  // Resize the panel as the user moves the mouse
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 150 && newWidth <= 600) {
      // Min and Max width limits
      setPanelWidth(newWidth);
    }
  };

  // Attach the mouse move and mouse up events
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleIconClick = (content: JSX.Element, panelName: string) => {
    if (panelContent.name === panelName && panelOpen) {
      setPanelOpen(false); // Close the panel on double click
      console.log("close panel");
      setTotalWidth(sidebarWidth);
    } else {
      setPanelContent({ content, name: panelName });
      setPanelOpen(true); // Open or change content on single click
      console.log("set panel");
      setTotalWidth(panelWidth + sidebarWidth);
    }
    console.log("panel input", panelContent, content, panelOpen);
  };

  const propertiesPanel = () => {
    return (
      <Box component="div" flexDirection="column" display="flex" gap="2">
        <Typography marginLeft="16px" variant="h6">
          Properties
        </Typography>
        <PropertiesPanel />
      </Box>
    );
  };

  return (
    <Box
      ref={panelRef}
      className={"rightSidePanel"}
      display="flex"
      height="100%"
      component={"div"}
      sx={{
        width: totalWidth,
        height: "100%",
        flexShrink: 0,
      }}
      position="relative"
    >
      {/* Persistant icon Bar */}

      <Box
        component={"div"}
        sx={{
          pointerEvents: "auto",
          backgroundColor: colors.primary[100],
          borderColor: colors.primary[900],
          display: "flex",
          padding: "6px",
          zIndex: 1100,
          width: "52px",
          gap: "3px",
          alignContent: "center",
          flexDirection: "column",
          height: "100%",
          borderLeft: "1px solid",
          position: "absolute",
          right: 0,
          // left: 100,
          top: 0,
        }}
      >
        <Tooltip title="Properties" placement="left" arrow>
          <IconButton
            style={{
              backgroundColor: panelContent.name === "overView" && panelOpen ? colors.grey[900] : "transparent",
            }}
            onClick={() => handleIconClick(propertiesPanel(), "overView")}
          >
            <Icon icon="lucide:table-properties" />{" "}
          </IconButton>
        </Tooltip>
      </Box>
      {/* exanpding Panel */}

      {panelOpen && (
        <Box
          ref={panelRef}
          className="rightPanelContentContainer"
          component="div"
          borderLeft="1px solid"
          position="absolute"
          marginRight="52px"
          right={0}
          style={{
            pointerEvents: "auto",
            width: `${panelWidth}px`, // Dynamic width based on resizing
            height: "100%",
            transform: panelOpen ? "translateX(0)" : `translateX(${panelWidth}px)`,
            transition: isResizing ? "none" : "transform 0.3s ease",
            zIndex: 1000,
            backgroundColor: colors.primary[100],
            borderColor: colors.primary[900],
            paddingTop: "16px",
          }}
        >
          {/* Resize Handle */}
          <Box
            component="div"
            className="rightPanelResizeHandle"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "10px",
              height: "100%",
              cursor: "ew-resize",
              // backgroundColor: "lightgrey",
              flexShrink: 1,
            }}
            onMouseDown={handleMouseDown}
          />
          {/* Main Panel Content Container */}
          <Box
            component="div"
            className="rightPanelContent"
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              height: "100%",
            }}
          >
            {/* Scrollable Content Area */}
            <Box
              component="div"
              style={{
                flexGrow: 1,
              }}
            >
              {panelContent.content}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RightSidePanel;
