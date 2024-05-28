import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme.js";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import Celebration from "@mui/icons-material/Celebration";
import InsertChart from "@mui/icons-material/InsertChart";

import Group from "@mui/icons-material/Group";
import Cable from "@mui/icons-material/Cable";
import Visibility from "@mui/icons-material/visibility";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";


interface ItemProps {
  title: string;
  to: string;
  icon: React.ReactNode;
  selected: string;
  setSelected: (title: string) => void;

}

const Item : React.FC<ItemProps> = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selected, setSelected] = useState("dashboard");
console.log(selected)
  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 10px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h4" color={colors.grey[100]}>
                  SAS
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
            </Box>
          )}

{/* <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/barChart"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            </Box> */}

<Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="OpenBim"
              to="/viewerOpenBim"
              icon={<Visibility />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Fiber"
              to="/viewerFiber"
              icon={<Cable />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Speckle"
              to="/viewerSpeckle"
              icon={<Group />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
          {/* <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Fun"
              to="/ViewerFun"
              icon={<Celebration />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box> */}

          {/* <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Table"
              to="/table"
              icon={<InsertChart />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box> */}
        
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;