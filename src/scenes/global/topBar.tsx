import { Box, IconButton, Typography, useTheme, Snackbar, Alert } from "@mui/material";
import {useContext, useState, useEffect} from "react"
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import UploadIfcButton from "../../components/uploadIfcButton";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import InsertChart from "@mui/icons-material/InsertChart";
import { Link } from "react-router-dom";
import React from "react";
import * as FRAGS from "@thatopen/fragments";
import * as OBC from "@thatopen/components";
import { useModelContext } from "../../context/ModelStateContext";
import { InfoPanel } from "./InfoPanel";
import { InfoPanelContext, InfoPanelDataProvider } from "../../context/InfoPanelContext";
// import "./topBar.css"


interface routerButtonProps {
    title: string;
    to: string;
    icon: any;
    selected: string;
    setSelected: (title: string) => void;
  
  }


const RoutingButton : React.FC<routerButtonProps> = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Link to={to}>
        <IconButton
        style={{
          color: colors.grey[100],
          textDecoration: 'none'
        }}
        onClick={() => {
            setSelected(title)
            console.log(to)
        }}>
        {icon}
        {/* <Typography>{title}</Typography> */}
        </IconButton>
    </Link>
    );
  };

interface TopbarProps {
    // onComponentsSet: ; // this should take component to manage top level better
    onIfcFileLoad: (ifcModel: any) => void;
}

const Topbar: React.FC<TopbarProps> = ({ onIfcFileLoad }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const modelContext = useModelContext();
    const infoPanelContext = useContext(InfoPanelContext);
    const [fileName, setFileName] = useState<string>('');
    const [selected, setSelected] = useState<string>('dashboard');
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  
    const handleDataUpdate = () => {
      if (!modelContext.selectedGroup) return;
      console.log('topbar: selected Group set', modelContext?.selectedGroup);
      infoPanelContext?.updateData({
        moduleFileName: modelContext.currentModel.name,
        moduleName: 'module name',
        groupType: modelContext.selectedGroup.groupType,
        groupName: modelContext.selectedGroup.groupName,
      });
    };
  
    const handleIFCLoad = (ifcModel: any) => {
      onIfcFileLoad(ifcModel);
      setSnackbarOpen(true);
    };
  
    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setSnackbarOpen(false);
    };
  
    // useEffect(() => {
    //   if (modelContext?.currentModel !== (FRAGS.FragmentsGroup.prototype as any)) {
    //     console.log('topbar: current model setting', modelContext?.currentModel);
    //   }
    // }, [modelContext?.currentModel]);
  
    useEffect(() => {
      handleDataUpdate();
    }, [modelContext?.selectedGroup]);
  
    return (
      <Box
        component={'div'}
        className='topBar'
        position={'absolute'}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        p={2}
        style={{ width: '100%' }}
        >
        <Box component={'div'} display='flex' alignItems='center'>
          <UploadIfcButton setFileName={setFileName} onIfcFileLoad={handleIFCLoad} />
        </Box>
        <InfoPanel />
        {/* TOP RIGHT CORNER */}
        <Box component={'div'} display='flex' alignItems='center'>
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === 'dark' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          </IconButton>
          {/* <RoutingButton
            title='Settings'
            to='/dashboard'
            icon={<MenuOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          /> */}
          {/* <RoutingButton
            title='Viewer'
            to='/'
            icon={<HomeOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          /> */}
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
