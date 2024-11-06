import React from "react";
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon, SxProps, Theme } from "@mui/material";
import { IconButtonConfig } from "../../../../components/floatingIconButton";

interface speedDialIconButtonsProps {
  buttons: IconButtonConfig[];
  containerSx?: SxProps<Theme>;
  mainIcon: React.ReactNode;
}


export const SpeedDialIconButton: React.FC<speedDialIconButtonsProps> = ({ mainIcon, buttons, containerSx }) => {
  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...containerSx,
      }}
    >
      <SpeedDial
        ariaLabel="Speed Dial"
        icon={mainIcon}
        direction="up" // Adjust the direction as needed
        sx={{ position: "absolute", bottom: 16, right: 16 }}
      >
        {buttons.map((button, index) => (
          <SpeedDialAction
            key={index}
            icon={button.icon}
            tooltipTitle={button.tooltip}
            tooltipOpen
            onClick={button.onClick}
            FabProps={{
              color: button.color,
              disabled: button.disabled,
              size: button.size,
              sx: button.sx,
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};



export default SpeedDialIconButton;
