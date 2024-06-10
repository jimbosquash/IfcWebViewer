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

interface topbarProps {
    // onComponentsSet: ; // this should take component to manage top level better
    onIfcFileLoad: (ifcModel: any) => void;
}

const Topbar = ({onIfcFileLoad} : topbarProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const [fileName, setFileName] = useState<string>("");
    const [selected, setSelected] = useState<string>("dashboard");
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);



    const handleIFCLoad = (ifcModel: FRAGS.FragmentsGroup | undefined) => {
        onIfcFileLoad(ifcModel)
        setSnackbarOpen(true);
    }

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if(reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false)
    }

    useEffect(() => {},[fileName])

    return (
        <Box component={"div"} className='topBar' display="flex" justifyContent="space-between" p={2}>
            <Box component={"div"}>
                <UploadIfcButton setFileName={setFileName} onIfcFileLoad={handleIFCLoad} /> 
            </Box>
            <Typography
            variant="h6"
            fontWeight='bold'
            sx={{color: colors.grey[100]}}>
            {fileName}
          </Typography>
            <Box component={"div"} display="flex" justifyContent="space-between" p={1}>
                <div>
                <IconButton onClick={colorMode.toggleColorMode}>
                {theme.palette.mode === "dark" ?(<DarkModeOutlinedIcon/>) : (<LightModeOutlinedIcon/>)}
                </IconButton>
                </div>
                <RoutingButton 
                title="Dashboard"
                to="/dashboard"
                icon={<InsertChart />}
                selected={selected}
                setSelected={setSelected}
                />
                <RoutingButton 
                title="Viewer"
                to="/"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                />          
            </Box>
            
            <Snackbar 
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                >
                    <Alert onClose={handleCloseSnackbar} severity='success' sx={{width: '100%'}}>
                    {fileName} loaded successfully!
                    </Alert>
            </Snackbar>
            
        </Box>
    )
}

export default Topbar;
