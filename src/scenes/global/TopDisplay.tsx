import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography, useTheme } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useContext, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { useTopBarContext } from "../../context/TopBarContext";
import { useComponentsContext } from "../../context/ComponentsContext";
import { ModelCache } from "../../bim-components/modelCache";

const height = "52px";
export const TopDisplay = () => {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const { toggleAssemblyBrowserPanel } = useTopBarContext();

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
    marginTop: "8px",
  };

  return (
    <>
      <AppBar position="static" sx={{ height: { height }, borderBottom: `1px solid ${colors.grey[100]}`, backgroundColor: colors.grey[100] }}>
        <Toolbar variant="dense" sx={{ minHeight: { height }, px: 2 }}>
          <Box
            component={"div"}
            sx={{ display: "flex", justifyContent: "space-between", alignContent: "center", width: "100%" }}
          >
            {/* <img src="/images/Sustainer-Beeldmerk-Beeldscherm-RGB-Kleur-Groot.png" alt="Logo" className="h-14"></img> */}

            <Box component="div" />
            <Box
              component="img"
              src="/images/Sustainer-Logo-Beeldscherm-RGB-Kleur-Klein.png"
              alt="Logo"
              sx={{
                height: "52px",
                objectFit: "contain",
              }}
            />
            <Box component="div" sx={{ ...buttonStyle }}>
              <Tooltip title={'display mode'}>
              <IconButton onClick={colorMode.toggleColorMode} style={{color: theme.palette.mode !== "dark" ? tokens("light").grey[900] : tokens("dark").grey[900] }}>
                {theme.palette.mode === "dark" ? (
                  <DarkModeOutlinedIcon fontSize="medium" />
                ) : (
                  <LightModeOutlinedIcon fontSize="medium" />
                )}
              </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopDisplay;
