import { Fab, SxProps, Theme, Tooltip } from "@mui/material";
import { ReactElement } from "react";

export interface IconButtonConfig {
    index?: number;
    icon: ReactElement;
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
    ariaLabel: string;
    onClick: () => void;
    size?: "small" | "medium" | "large";
    tooltip?: string;
    sx?: SxProps<Theme>;
    disabled?: boolean;
  }

export const FloatingIconButton : React.FC<IconButtonConfig> = ({index, tooltip, ariaLabel,disabled, color,onClick,size, sx,icon }) => {
    return(
      <Tooltip
            key={index}
            placement="left"
            title={tooltip ?? ariaLabel}
          >
            <span>
              <Fab
                disabled={disabled ?? false}
                color={color || "primary"}
                aria-label={ariaLabel}
                onClick={onClick}
                size={size || "medium"}
                sx={{ mb: 1, ...sx }}
              >
                {icon}
              </Fab>
            </span>
          </Tooltip>
    )
  } 

  export default FloatingIconButton; 