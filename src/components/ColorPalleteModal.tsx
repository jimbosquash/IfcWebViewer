import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Box,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import { tokens } from '../theme';

interface colorPalletProps {
    open: boolean;
}
const ColorPaletteModal: React.FC<colorPalletProps> = ({open}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
      const [isOpen, setOpen] = useState(open);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
{/* <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Color Palette Reference</DialogTitle>
        <DialogContent> */}
          {Object.keys(colors).map((colorKey) => (
            <Box component='div' key={colorKey} mb={4}>
              <Typography variant="h6" gutterBottom>
                {colorKey}
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(colors[colorKey]).map(([shade, hex]) => (
                  <Grid item xs={4} sm={2} md={1} key={shade}>
                    <Box 
                    component='div'
                      sx={{
                        backgroundColor: hex,
                        height: 60,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.getContrastText(hex), // Adjust text color for readability
                      }}
                    >
                      <Typography variant="caption">{shade}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        {/* </DialogContent>
      </Dialog> */}
      
    </div>
  );
};



export default ColorPaletteModal;
