import { Box, IconButton, Tooltip, useTheme, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../../theme";
import { useEffect, useRef, useState } from "react";
import { BimSettings } from "../../../components/BimSettings";
import ColorPaletteModal from "../../../components/ColorPalleteModal";
import { useComponentsContext } from "../../../context/ComponentsContext";
import ProjectOverviewPanel from "./src/ProjectOverViewPanel";
import TaskBrowserPanel from "./src/TaskBrowserPanel";
import SettingsPanel from "./src/settingsPanel";
import { sidebarWidth } from "../rightSidePanel";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { ViewPresenterPanel } from "../../../components/ViewPresenterPanel";
import { PanelBase } from "../../../components/PanelBase";

const minWidth = 220;

export const LeftSidePanel: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(310); // Initial width of the panel
  const [isResizing, setIsResizing] = useState(false);
  const [autoOpen, setAutoOpen] = useState(true);
  const [totalWidth, setTotalWidth] = useState(sidebarWidth);
  const panelAutoOpen = useRef<boolean>(true);
  const [panelContent, setPanelContent] = useState<{ content: JSX.Element | null; name: string }>({
    content: null,
    name: "",
  });

  useEffect(() => {
    setTotalWidth(panelOpen ? panelWidth + sidebarWidth : sidebarWidth);
  }, [panelWidth]);

  useEffect(() => {
    // listen for new models
    if (!components) return;

    const viewManager = components.get(ModelViewManager);
    console.log("side panel listening");

    viewManager.onTreeChanged.add(() => listenForTreeChange());

    return () => {
      // unlisten
      viewManager.onTreeChanged.remove(() => listenForTreeChange());
      console.log("side panel stop listening");
    };
  }, [components]);

  const listenForTreeChange = () => {
    if (!panelAutoOpen.current) {
      components.get(ModelViewManager).onTreeChanged.remove(() => listenForTreeChange());
      return;
    }
    // console.log("side panel listening for model");

    if (!autoOpen) return;

    handleIconClick(<ProjectOverviewPanel />, "overView");

    setPanelOpen(true);
    setAutoOpen(false);
  };

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
  // Start the resizing
  const handleMouseDown = (e: React.MouseEvent) => setIsResizing(true);
  // Stop the resizing
  const handleMouseUp = () => setIsResizing(false);

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
      <PanelBase
        title="Comments panel"
        body="Use comments to by clicking the button then clicking on desired element. Comments will only be saved if you
      export a new Ifc model."
        icon="mdi:file-tree-outline"
      >
        <TaskBrowserPanel />
      </PanelBase>
    );
  };

  return (
    <Box
      display="flex"
      className="leftSidePanel"
      component={"div"}
      sx={{
        width: totalWidth,
        height: "100%",
        flexShrink: 0,
      }}
    >
      <Box
        component={"div"}
        style={{ pointerEvents: "auto", backgroundColor: colors.primary[100], borderColor: colors.primary[900] }} // or 400
        display="flex"
        padding="6px"
        zIndex={1100}
        width={sidebarWidth}
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

        <Tooltip title="Presentation" placement="right" arrow>
          <IconButton
            style={{
              backgroundColor: panelContent.name === "Presentations" && panelOpen ? colors.grey[900] : "transparent",
            }}
            onClick={() => handleIconClick(<ViewPresenterPanel />, "Presentations")}
          >
            <Icon icon="ph:video-camera-bold" />
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
                  <BimSettings />
                  <SettingsPanel />
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
        className="leftPanelContentContainer"
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
            width: "100%",
            height: "100%",
          }}
        >
          {/* Scrollable Content Area */}
          <Box
            component="div"
            style={{
              flexGrow: 1,
              height:'100%',
            }}
          >
            {panelContent.content}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LeftSidePanel;
