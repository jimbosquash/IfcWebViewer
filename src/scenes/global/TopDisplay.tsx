import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography, useTheme } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useContext, useEffect, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { useTopBarContext } from "../../context/TopBarContext";
import { useComponentsContext } from "../../context/ComponentsContext";
import { ModelCache } from "../../bim-components/modelCache";
// import { UploadIfcButton } from "../../components/UploadIfcButton";

const height = "52px";
export const TopDisplay = () => {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const { toggleAssemblyBrowserPanel } = useTopBarContext();
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    // add load listener
    if (!components) return;

    //toggleSidePanel(true)
    const cache = components.get(ModelCache);
    cache.onModelAdded.add(() => handleModelLoad());
    return () => {
      //dettach
      cache.onModelAdded.remove(() => handleModelLoad());
    };
  }, [components]);

  const handleModelLoad = () => {
    setModelLoaded(true);
  };

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
      <AppBar
        position="static"
        sx={{ height: { height }, borderBottom: `1px solid ${colors.grey[100]}`, backgroundColor: colors.grey[100] }}
      >
        <Toolbar variant="dense" sx={{ minHeight: { height }, px: 2 }}>
          <Box
            component={"div"}
            alignContent="center"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignContent: "center",
              width: "100%",
            }}
          >
            {/* <img src="/images/Sustainer-Beeldmerk-Beeldscherm-RGB-Kleur-Groot.png" alt="Logo" className="h-14"></img> */}
            <Box component="div" alignContent="center">
              {/* {modelLoaded && <UploadIfcButton />} */}
            </Box>

            <Box
              component="div"
              display="flex"
              alignItems="flex-end" // Changed from 'center' to 'flex-end'
              justifyContent="center" // Added to center horizontally
              sx={{
                height: "100%", // Ensure the box takes full height of its container
                width: "100%", // Ensure the box takes full width of its container
              }}
            >
              <Box
                component="img"
                src="/images/Sustainer-Logo-Beeldscherm-RGB-Kleur-Klein.png"
                alt="Logo"
                sx={{
                  height: "52px",
                  objectFit: "contain",
                  marginRight: "0px", // Added some spacing between logo and text
                }}
              />
              <Typography variant="h4"
                style={{
                  marginBottom:'12px',
                  color: theme.palette.mode !== "dark" ? tokens("light").grey[700] : tokens("dark").grey[700],
                  alignSelf: "bottom", // Align the text vertically with the logo
                }}
              >
                .ifc
              </Typography>
            </Box>

            <Box component="div" alignContent="center">
              <Tooltip title={"display mode"}>
                <IconButton
                  onClick={colorMode.toggleColorMode}
                  style={{
                    color: theme.palette.mode !== "dark" ? tokens("light").grey[900] : tokens("dark").grey[900],
                  }}
                >
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
