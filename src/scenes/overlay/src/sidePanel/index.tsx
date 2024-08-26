import { Box, IconButton, Tooltip, useTheme, Typography, Paper, styled } from "@mui/material";
import { Icon } from "@iconify/react";
import { tokens } from "../../../../theme";
import { useState } from "react";
import AssemblyBrowser from "../AssemblyBrowser";

export const SideBox: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [panelOpen, setPanelOpen] = useState(false);
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

  return (
    <Box display="flex" height="100vh" component={"div"}>
       <Box
        component={"div"}
        style={{pointerEvents: "auto", backgroundColor:colors.primary[100], borderColor:colors.primary[800] }} // or 400
        display="flex"
        padding="6px"
        zIndex={1100}
        width="52px"
        gap="3px"
        alignContent="center"
        flexDirection="column"
        height="100%"
        borderColor="yellow"
        borderRight="1px solid"
      >
        <Tooltip title="Project overview" placement="right" arrow>
          <IconButton onClick={() => handleIconClick(<><Typography variant="h6">Home Content</Typography>
          <Box component={'div'}>
            <AssemblyBrowser/>

          </Box>
          </>, "overView")}>
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
            onClick={() => handleIconClick(<Typography variant="h6">Settings Content</Typography>, "settings")}
          >
            <Icon icon="material-symbols:settings-outline" />
          </IconButton>
        </Tooltip>
      </Box>
      {/* Sliding Panel */}
      <Box
      component={'div'}
      borderRight="1px solid"
      borderColor={colors.primary[800]}

          style={{
            pointerEvents: "auto",
            position: "relative",
            width: "250px",
            height: "100%",
            transform: panelOpen ? "translateX(0)" : "translateX(-250px)",
            transition: "transform 0.3s ease",
            zIndex: 1000, 
            padding: "16px",
            backgroundColor:colors.primary[100], // or 400
          }}
        >
          {panelContent.content}
        </Box>
    </Box>
  );
};

export default SideBox;
