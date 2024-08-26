import React, { useState } from 'react';
import { 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon, 
  Popover, 
  Button,
  Box
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Print as PrintIcon, 
  Share as ShareIcon, 
  MoreVert as MoreVertIcon 
} from '@mui/icons-material';

interface FloatingButtonPanelProps {
  position?: {
    bottom?: number | string;
    right?: number | string;
    top?: number | string;
    left?: number | string;
  };
}

export const CameraButtonPanel: React.FC<FloatingButtonPanelProps> = ({ position = { bottom: 16, right: 16 } }) => {
  const [open, setOpen] = useState(true);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLButtonElement | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, actionName: string) => {
    setPopoverAnchor(event.currentTarget);
    setActiveAction(actionName);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setActiveAction(null);
  };

  const actions = [
    { icon: <SaveIcon />, name: 'Save', subActions: ['Save As', 'Auto Save', 'Save All'] },
    { icon: <PrintIcon />, name: 'Print', subActions: ['Print All', 'Print Selection', 'Print Preview'] },
    { icon: <ShareIcon />, name: 'Share', subActions: ['Email', 'Twitter', 'Facebook'] },
  ];

  return (
    <>
      {/* <SpeedDial
        ariaLabel="Camera options"
        icon={<SpeedDialIcon openIcon={<MoreVertIcon />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
        sx={{ position: 'fixed', ...position }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={(event) => handleActionClick(event as unknown as React.MouseEvent<HTMLButtonElement>, action.name)}
          />
        ))}
      </SpeedDial>
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Box component="div" sx={{ display: 'flex', p: 1 }}>
          {activeAction && actions.find(action => action.name === activeAction)?.subActions.map((subAction) => (
            <Button key={subAction} onClick={() => console.log(`Clicked ${subAction}`)}>
              {subAction}
            </Button>
          ))}
        </Box>
      </Popover> */}
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Box component="div" sx={{ display: 'flex', p: 1 }}>
          {activeAction && actions.find(action => action.name === activeAction)?.subActions.map((subAction) => (
            <Button key={subAction} onClick={() => console.log(`Clicked ${subAction}`)}>
              {subAction}
            </Button>
          ))}
        </Box>
      </Popover>
    </>
  );
};
