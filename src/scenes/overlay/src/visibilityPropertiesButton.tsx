import { Tooltip, Button, Paper, Popover, ToggleButton, Typography, useTheme, Box } from "@mui/material";
import { GiClick } from "react-icons/gi";
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { PiSelectionBackgroundBold } from "react-icons/pi";

import StyledToggleButtonGroup from "../../../components/StyledToggleButtonGroup";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { tokens } from "../../../theme";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { VisibilityMode } from "../../../utilities/types";

export const VisibilityPropertiesButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedVisibilityMode, setVisibiliyMode] = useState<VisibilityMode>();

  const [open, setOpen] = useState<boolean>(false);
  const id = open ? "Visibility-popover" : undefined;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const handleVisibilityMode = (
    event: React.MouseEvent<HTMLElement>,
    visibilityMode: VisibilityMode | null
  ) => {
    const viewManager = components?.get(ModelViewManager);
    if (!visibilityMode || !viewManager || visibilityMode === viewManager.VisibilityMode) return;
    setVisibiliyMode(visibilityMode);

    if (visibilityMode?.toString() === "Isolate") viewManager.VisibilityMode = VisibilityMode.Isolate;
    if (visibilityMode?.toString() === "Passive") viewManager.VisibilityMode = VisibilityMode.Passive;
    

    console.log("Visibility mode",visibilityMode?.toString(), viewManager.VisibilityMode)
    handleClose();

  };


  return (
    <>
      <Tooltip title="Visibility Mode">
        <Button
          onClick={handleClick}
          style={{ color: colors.grey[200], border: "0" }}
          variant={open ? "contained" : "outlined"}
        >
          <FaEye size="20px" />
        </Button>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        marginThreshold={90}
      >
        <Paper sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Box component={"div"} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <StyledToggleButtonGroup
              aria-label="Small sizes"
              exclusive
              size="small"
              value={selectedVisibilityMode}
              onChange={handleVisibilityMode}
            >
              <Tooltip title="Select">
                <ToggleButton
                  selected={selectedVisibilityMode === VisibilityMode.Passive}
                  size="small"
                  value="Passive"
                  aria-label="left aligned"
                  color="secondary"
                >
                  <GiClick size={20} />
                </ToggleButton>
              </Tooltip>

              <Tooltip title="Isolation">
                <ToggleButton
                  selected={selectedVisibilityMode === VisibilityMode.Isolate}
                  size="small"
                  value="Isolation"
                  aria-label="right aligned"
                  color="secondary"
                >
                  <PiSelectionBackgroundBold size={20} />
                </ToggleButton>
              </Tooltip>
            </StyledToggleButtonGroup>

            <Typography color="main" variant="caption" sx={{ ml: 1, mr:1 }}>
              DISPLAY MODE
            </Typography>
          </Box>

          {/* <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} /> */}
        </Paper>
      </Popover>
    </>
  );
};
