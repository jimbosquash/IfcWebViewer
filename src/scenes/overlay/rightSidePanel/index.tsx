import { Box, IconButton, Tooltip, useTheme, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../../theme";
import { useEffect, useState } from "react";
import PropertyOverViewPanel from "./src/propertyOverViewPanel";

export const RightSidePanel: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [panelOpen, setPanelOpen] = useState(false);

  const [panelContent, setPanelContent] = useState<{ content: JSX.Element | null; name: string }>({
    content: null,
    name: "",
  });

  const [panelWidth, setPanelWidth] = useState(250); // Initial width of the panel
  const [isResizing, setIsResizing] = useState(false);

  // Start the resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
  };

  // Resize the panel as the user moves the mouse
  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 150 && newWidth <= 600) { // Min and Max width limits
        setPanelWidth(newWidth);
      }
    }
  };

  // Stop the resizing
  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Attach the mouse move and mouse up events
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleIconClick = (content: JSX.Element, panelName: string) => {
    if (panelContent.name === panelName && panelOpen) {
      setPanelOpen(false); // Close the panel on double click
      console.log("close panel");
    } else {
      setPanelContent({ content, name: panelName });
      setPanelOpen(true); // Open or change content on single click
      console.log("set panel");
    }
    console.log("panel input", panelContent, content, panelOpen);
  };

  return (
    <Box display="flex" height="100vh" width="100vw" component={"div"} position="absolute">
      <Box
        component={"div"}
        style={{ pointerEvents: "auto", backgroundColor: colors.primary[100], borderColor: colors.primary[900] }} // or 400
        display="flex"
        padding="6px"
        zIndex={1100}
        width="52px"
        gap="3px"
        alignContent="center"
        flexDirection="column"
        height="100%"
        borderLeft="1px solid"
        position="fixed" // Position it absolutely within its container
        right={0} // Align it to the right side of its container
        // top={0} // Align it to the top of its container
      >
        <Tooltip title="Properties" placement="left" arrow>
          <IconButton
            onClick={() =>
              handleIconClick(
                <Box component="div" flexDirection="column" display="flex" gap="2">
                  <Typography marginLeft='16px' variant="h6">Properties</Typography>
                  <PropertyOverViewPanel />
                </Box>,
                "overView"
              )
            }
          >
            <Icon icon="lucide:table-properties" />{" "}
          </IconButton>
        </Tooltip>
      </Box>
      {/* Sliding Panel */}
      <Box
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
          paddingTop:'16px'
        }}
      >
        {/* Resize Handle */}
        <Box
          component="div"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "5px",
            cursor: "ew-resize",
            // backgroundColor: "darkgrey",
          }}
          onMouseDown={handleMouseDown}
        />
        {/* Panel Content */}
        {panelContent.content}
      </Box>
    </Box>
  );
};

export default RightSidePanel;
