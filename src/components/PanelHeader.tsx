import { Box, useTheme, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

import { tokens } from "../theme";

interface PanelHeaderProps {
  title: string;
  body: string;
  icon?: string; //iconify system
}
export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, body, icon }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <>
      <Box component="div" flexDirection="column" display="flex" marginBottom="10px" gap="4">
        <Box component="div" flexDirection="row" display="flex" marginLeft="10px" gap="4">
          { icon && <Icon style={{ color: colors.grey[500] }} icon={icon} />}
          <Typography marginLeft="8px" variant="h5">
            {title}
          </Typography>
        </Box>
        <Typography margin="14px" variant="body2">
          {body}
        </Typography>
      </Box>
    </>
  );
};
