import { Box, IconButton, Tooltip, useTheme, Typography, Paper, styled } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../../theme";
import { useEffect, useState } from "react";
import StationBrowserPanel from "./src/StationBrowserPanel";
import { BimSettings } from "../../../components/BimSettings";
import ColorPaletteModal from "../../../components/ColorPalleteModal";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { ModelCache } from "../../../bim-components/modelCache";
import ProjectOverviewPanel from "./src/ProjectOverViewPanel";
import TaskBrowserPanel from "./src/TaskBrowserPanel";

const minWidth = 220;

export const LeftSideBox: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(310); // Initial width of the panel
  const [isResizing, setIsResizing] = useState(false);
  const [autoOpen, setAutoOpen] = useState(true);
  const sidebarWidth = 52;
  const [panelContent, setPanelContent] = useState<{ content: JSX.Element | null; name: string }>({
    content: null,
    name: "",
  });

  useEffect(() => {
    // listen for new models
    if (!components) return;

    const fragments = components.get(ModelCache);
    console.log("side panel listening");

    fragments.onModelAdded.add(() => listenForModels());

    return () => {
      // unlisten
      fragments.onModelAdded.remove(() => listenForModels());
      console.log("side panel stop listening");
    };
  }, [components]);

  const listenForModels = () => {
    console.log("side panel listening for model");

    if (!autoOpen) return;

    handleIconClick(<ProjectOverviewPanel />, "overView");

    setPanelOpen(true);
    setAutoOpen(false);
  };

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

  const CommentsPanel = () => {
    return (
      <Box component="div" flexDirection="column" display="flex" width="100%" marginTop="20px" marginLeft="5px" gap="2">
        <Box component="div" flexDirection="row" display="flex" marginLeft="10px" gap="4">
          <Icon style={{ color: colors.grey[500] }} icon="mdi:chat-add-outline" />
          <Typography marginLeft="8px" variant="h5">
            Comments Content
          </Typography>
        </Box>
        <Typography marginLeft="8px" marginRight="16px" marginTop="8px" variant="body2">
          Use comments to by clicking the button then clicking on desired element. Comments will only be saved if you
          export a new Ifc model.{" "}
        </Typography>
        <TaskBrowserPanel />
        {/* // Use the navigation arrows to move through them. */}
      </Box>
    );
  };

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
            style={{
              backgroundColor: panelContent.name === "overView" && panelOpen ? colors.grey[900] : "transparent",
            }}
            onClick={() => handleIconClick(<ProjectOverviewPanel />, "overView")}
          >
            <Icon icon="mdi:file-tree-outline" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Comments" placement="right" arrow>
          <IconButton
            style={{
              backgroundColor: panelContent.name === "comments" && panelOpen ? colors.grey[900] : "transparent",
            }}
            onClick={() => handleIconClick(CommentsPanel(), "comments")}
          >
            <Icon icon="mdi:chat-add-outline" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings" placement="right" arrow>
          <IconButton
            style={{
              backgroundColor: panelContent.name === "settings" && panelOpen ? colors.grey[900] : "transparent",
            }}
            onClick={() =>
              handleIconClick(
                <>
                  <Typography variant="h6">Settings Content</Typography>
                  <BimSettings />
                </>,
                "settings"
              )
            }
          >
            <Icon icon="material-symbols:settings-outline" />
          </IconButton>
        </Tooltip>

        {process.env.NODE_ENV === "development" && (
          <IconButton
            onClick={() =>
              handleIconClick(
                <>
                  <Typography variant="h6">Color Pallete</Typography>
                  <ColorPaletteModal open={true} />
                </>,
                "settings"
              )
            }
          >
            <Icon icon="mdi:color" />{" "}
          </IconButton>
        )}
      </Box>
      {/* exanpding Panel */}
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

          // padding: "0px",
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

        {/* Main Panel Content Container */}
        <Box
          component="div"
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            width:'100%',
            height: "100%",
          }}
        >
          {/* You can add a header here if needed */}

          {/* Scrollable Content Area */}
          <Box
            component="div"
            style={{
              flexGrow: 1,
            }}
          >
            {panelContent.content}
          </Box>

          {/* You can add a footer here if needed */}
        </Box>
      </Box>
    </Box>
  );
};

export default LeftSideBox;
