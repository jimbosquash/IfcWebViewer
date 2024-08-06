import { AppBar, Box, Button, IconButton, Toolbar, useTheme } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useContext, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { SidePanelType, useTopBarContext } from "../../context/TopBarContext";
import { useComponentsContext } from "../../context/ComponentsContext";
import { ModelCache } from "../../bim-components/modelCache";

export const TopDisplay = () => {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const {
    toggleSidePanel,
    isAssemblyBrowserVisible,
    isSidePanelVisible,
    isPropertiesPanelVisible,
    togglePropertiesPanel,
    toggleAssemblyBrowserPanel,
  } = useTopBarContext();

  useEffect(() => {
    // add load listener
    if (!components) return;

    toggleSidePanel(true)
    const cache = components.get(ModelCache);
    cache.onModelAdded.add(() => toggleAssemblyBrowserPanel(true));
    return () => {
      //dettach
      cache.onModelAdded.remove(() => toggleAssemblyBrowserPanel(true));
    };
  }, [components]);

  const activeButtonStyle = {
    backgroundColor: colors.primary[800],
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  };

  const buttonStyle = {
    margin: "5px",
  };

  return (
    <>
      <AppBar position="static" sx={{ height: "45px" }}>
        <Toolbar variant="dense" sx={{ minHeight: "45px", px: 2 }}>
          <Box component={"div"} sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {/* left setting panel options */}
            <Box component="div">
              <Button
                onClick={() => toggleSidePanel(SidePanelType.SETTINGS)}
                color="inherit"
                sx={{ ...buttonStyle, ...(isSidePanelVisible ? activeButtonStyle : {}) }}
              >
                Settings
              </Button>
              <Button
                onClick={() => toggleAssemblyBrowserPanel(undefined)}
                color="inherit"
                sx={{ ...buttonStyle, ...(isAssemblyBrowserVisible ? activeButtonStyle : {}) }}
              >
                Assembly Browser
              </Button>

              <Button
                onClick={() => togglePropertiesPanel(undefined)}
                color="inherit"
                sx={{ ...buttonStyle, ...(isPropertiesPanelVisible ? activeButtonStyle : {}) }}
              >
                Properties
              </Button>
            </Box>

            {/* center content */}
            <Box component="div" sx={{ ...buttonStyle }}>
              <IconButton onClick={colorMode.toggleColorMode}>
                {theme.palette.mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopDisplay;
