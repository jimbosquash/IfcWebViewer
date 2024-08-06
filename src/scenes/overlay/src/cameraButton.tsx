import React, { useState } from 'react';
import { 
  Button, 
  ButtonGroup, 
  Tooltip, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton, 
  Collapse 
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const CameraButton = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [openProjects, setOpenProjects] = useState(false);
  const [openNavigation, setOpenNavigation] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleListItemClick = (option: string) => {
    setSelectedCamera(option);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'camera-popover' : undefined;

  return (
    <>
      <ButtonGroup>
        <Tooltip title="Camera Options">
          <Button onClick={handleClick} variant={open ? 'contained' : 'outlined'}>
            <CameraAltIcon />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List>
          <Collapse in={openNavigation} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => handleListItemClick('Navigation Option 2')} selected={selectedCamera === 'Navigation Option 2'}>
                <ListItemText primary="Option 2" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => handleListItemClick('Navigation Option 1')} selected={selectedCamera === 'Navigation Option 1'}>
                <ListItemText primary="Option 1" />
              </ListItemButton>
            </List>
          </Collapse>
          <ListItemButton onClick={() => setOpenNavigation(!openNavigation)}>
            <ListItemText primary="Navigation" />
            {openNavigation ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={openProjects} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => handleListItemClick('Project Option 2')} selected={selectedCamera === 'Project Option 2'}>
                <ListItemText primary="Option 2" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => handleListItemClick('Project Option 1')} selected={selectedCamera === 'Project Option 1'}>
                <ListItemText primary="Option 1" />
              </ListItemButton>
            </List>
          </Collapse>
          <ListItemButton onClick={() => setOpenProjects(!openProjects)}>
            <ListItemText primary="Projects" />
            {openProjects ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </List>
      </Popover>
    </>
  );
};

export default CameraButton;