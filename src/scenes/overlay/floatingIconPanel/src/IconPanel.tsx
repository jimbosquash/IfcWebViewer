import React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import FloatingIconButton, { IconButtonConfig } from "../../../../components/floatingIconButton";

interface FloatingIconButtonsProps {
  buttons: IconButtonConfig[];
  containerSx?: SxProps<Theme>;
}

const IconPanel: React.FC<FloatingIconButtonsProps> = ({ buttons, containerSx }) => {

  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "column",
        ...containerSx,
      }}
    >
      {buttons.map((button, index) => (
        <FloatingIconButton
        key={index}
        tooltip={button.tooltip}
        ariaLabel={button.ariaLabel}
        disabled={button.disabled}
        color={button.color}
        onClick={button.onClick}
        size={button.size}
        sx={button.sx}
        icon={button.icon}
        
        />
      ))}
    </Box>
  );
};



export default IconPanel;
