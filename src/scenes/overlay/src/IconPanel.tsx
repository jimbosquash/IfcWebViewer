import React, { ReactElement } from "react";
import { Fab, Box, SxProps, Theme } from "@mui/material";

export interface IconButtonConfig {
  icon: ReactElement;
  color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
  ariaLabel: string;
  onClick: () => void;
  size?: "small" | "medium" | "large";
  sx?: SxProps<Theme>;
}

interface FloatingIconButtonsProps {
  buttons: IconButtonConfig[];
  containerSx?: SxProps<Theme>;
}

const IconPanel: React.FC<FloatingIconButtonsProps> = ({ buttons, containerSx }) => {
  const defaultButtonSx: SxProps<Theme> = { mb: 1,};

  return (
    <Box
      component="div"
      sx={{
        position: "fixed",
        right: 16,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        ...containerSx,
      }}
    >
      {buttons.map((button, index) => (
        <Fab
          key={index}
          color={button.color || "primary"}
          aria-label={button.ariaLabel}
          onClick={button.onClick}
          size={button.size || "medium"}
          sx={{ ...defaultButtonSx, ...button.sx }}
        >
          {button.icon}
        </Fab>
      ))}
    </Box>
  );
};

export default IconPanel;
