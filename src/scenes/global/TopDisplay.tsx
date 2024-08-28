import { AppBar, Box, IconButton, Toolbar, Typography, useTheme } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useContext, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { useTopBarContext } from "../../context/TopBarContext";
import { useComponentsContext } from "../../context/ComponentsContext";
import { ModelCache } from "../../bim-components/modelCache";


const height = "38px"
export const TopDisplay = () => {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const {
    toggleAssemblyBrowserPanel,
  } = useTopBarContext();

  useEffect(() => {
    // add load listener
    if (!components) return;

    //toggleSidePanel(true)
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
      <AppBar position="static" sx={{ height: {height}, borderBottom: `1px solid ${colors.primary[900]}` }}>
        <Toolbar variant="dense" sx={{ minHeight: {height}, px: 2 }}>
          <Box component={"div"} sx={{ display: "flex", justifyContent: "space-between",alignContent:'center', width: "100%" }}>
            {/* left setting panel options */}
            {/* <Box component="div">
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
            </Box> */}

            {/* center content */}

            {/* <> */}
            {/* <img src="/images/Sustainer-Beeldmerk-Beeldscherm-RGB-Kleur-Groot.png" alt="Logo" className="h-14"></img> */}
            
            <Box component='div'/>
            <Box
              component="img"
              src="/images/Sustainer-Logo-Beeldscherm-RGB-Kleur-Klein.png"
              alt="Logo"
              sx={{
                width: "100px",
                height: "40px",
                objectFit: "contain",
              }}
            />
            <Box component="div" sx={{ ...buttonStyle }}>
              <IconButton style={{height:18, width:18}} onClick={colorMode.toggleColorMode}>
                {theme.palette.mode === "dark" ? (
                  <DarkModeOutlinedIcon fontSize="small" />
                ) : (
                  <LightModeOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopDisplay;
