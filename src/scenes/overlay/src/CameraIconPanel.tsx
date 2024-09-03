import React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import { Icon } from "@iconify/react";
import IconPanel, { IconButtonConfig } from "./IconPanel";

const CameraIconPanel: React.FC = () => {
  const defaultButtonSx: SxProps<Theme> = { mb: 1 };

  const buttonConfigs: IconButtonConfig[] = [
    {
      icon: <Icon icon="mdi:camera" />,
      color: "primary",
      ariaLabel: "capture",
      onClick: () => console.log('capture click'),
    },
    {
      icon: <Icon icon="mdi:image-multiple" />,
      color: "secondary",
      ariaLabel: "gallery",
      onClick: () => console.log('gallery click'),
    },
    {
      icon: <Icon icon="mdi:cog" />,
      color: "inherit",
      ariaLabel: "settings",
      onClick: () => console.log('settings click'),
    },
  ];

  return (
    <Box
      component="div"
      sx={{
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        transition: "right 0.3s ease",
      }}
    >
      <IconPanel buttons={buttonConfigs} />
    </Box>
  );
};

export default CameraIconPanel;
