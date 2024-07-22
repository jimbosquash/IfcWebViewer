import { Box, IconButton, useTheme, Snackbar, Alert } from "@mui/material";
import {useContext, useState} from "react"
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import React from "react";
import { InfoPanel } from "../overlay/src/InfoPanel";

const Topbar: React.FC = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const [fileName, setFileName] = useState<string>('');
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  

  
    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setSnackbarOpen(false);
    };
  
    // useEffect(() => {
    //   handleDataUpdate();
    // }, [modelContext?.selectedGroup]);
  
    return (
      <Box
        component='div'
        className='topBar'
        position='relative'
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        p={2}
        width= '100%' 
        >
        <InfoPanel />

        {/* TOP RIGHT CORNER ICON BUTTONS */}
        <Box 
        component='div'
        position="absolute"
        top={0}
        right={0}
        p={2}
        >
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === 'dark' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          </IconButton>
        </Box>

        {/* corner pop up */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity='success' sx={{ width: '100%' }}>
            {fileName} loaded successfully!
          </Alert>
        </Snackbar>
      </Box>
    );
  };

export default Topbar;
