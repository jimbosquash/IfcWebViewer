import { Box, IconButton, Tooltip, useTheme, Typography, Paper, styled } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../../theme";
import { useEffect, useState } from "react";
import AssemblyBrowser from "../src/AssemblyBrowser";
import { BimSettings } from "../../../components/BimSettings";

const minWidth = 200;

export const LeftSideBox: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(250); // Initial width of the panel
  const [isResizing, setIsResizing] = useState(false);
  const sidebarWidth = 52;
  const [panelContent, setPanelContent] = useState<{ content: JSX.Element | null; name: string }>({
    content: null,
    name: "",
  });

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

  // Start the resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
  };

  // Resize the panel as the user moves the mouse
  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX - sidebarWidth;
      if (newWidth >= minWidth && newWidth <= 600) {
        // Min and Max width limits
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

  return (
    <Box display="flex" height="100vh" component={"div"} position="absolute">
      <Box
        component={"div"}
        style={{ pointerEvents: "auto", backgroundColor: colors.primary[100], borderColor: colors.primary[900] }} // or 400
        display="flex"
        padding="6px"
        zIndex={1100}
        width="{sidebarWidth}px"
        gap="3px"
        alignContent="center"
        flexDirection="column"
        height="100%"
        borderColor="yellow"
        borderRight="1px solid"
      >
<Box
              component="img"
              src="/images/Sustainer-Beeldmerk-Beeldscherm-RGB-Kleur-Klein.png"
              alt="Logo"
              sx={{
                width: "42px",
                height: "42px",
                objectFit: "contain",
              }}
            />

        <Tooltip title="Project overview" placement="right" arrow>
          <IconButton
            onClick={() =>
              handleIconClick(
                <Box component="div" flexDirection="column" display="flex" gap="2">
                  {/* <Typography variant="h6">Project Overview</Typography> */}
                  <AssemblyBrowser />
                </Box>,
                "overView"
              )
            }
          >
            <Icon icon="mdi:file-tree-outline" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Comments" placement="right" arrow>
          <IconButton
            onClick={() => handleIconClick(<Typography variant="h6">Comments Content</Typography>, "comments")}
          >
            <Icon icon="mdi:chat-add-outline" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings" placement="right" arrow>
          <IconButton
            onClick={() => handleIconClick(<>
            <Typography variant="h6">Settings Content</Typography>
            <BimSettings />
            </>, "settings")}
          >
            <Icon icon="material-symbols:settings-outline" />
          </IconButton>
        </Tooltip>

        
      </Box>
      {/* Sliding Panel */}
      <Box
        component={"div"}
        borderRight="1px solid"
        display="flex"
        style={{
          flexDirection: "row",
          pointerEvents: "auto",
          position: "relative",
          width: `${panelWidth}px`, // Dynamic width based on resizing
          height: "100%",
          transform: panelOpen ? "translateX(0)" : `translateX(-${panelWidth}px)`,
          transition: isResizing ? "none" : "transform 0.3s ease",
          backgroundColor: colors.primary[100],
          borderColor: colors.primary[900],
          zIndex: 1000,
          padding: "16px",
        }}
      >
        {/* Resize Handle */}
        <Box
          component="div"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "5px",
            cursor: "ew-resize",
          }}
          onMouseDown={handleMouseDown}
        />
        {/* Panel Content */}
        <Box
          component="div"
          flexGrow={1} // Allow the content to take up the remaining space
        >
          {panelContent.content}
        </Box>
      </Box>

      
    </Box>
  );
};

export default LeftSideBox;
