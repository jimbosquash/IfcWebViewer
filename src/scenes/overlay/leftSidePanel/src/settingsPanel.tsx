import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Switch,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  SelectChangeEvent,
  Divider,
} from "@mui/material";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import { ModelTagger } from "../../../../bim-components/modelTagger";
import { ModelCache } from "../../../../bim-components/modelCache";

// Define types for our setting components
interface ToggleSettingProps {
  label: string;
  value: boolean;
  onChange: (checked: boolean) => void;
}

interface ButtonSettingProps {
  label: string;
  onClick: () => void;
}

interface OptionSettingProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

// Individual setting component templates
const ToggleSetting: React.FC<ToggleSettingProps> = ({ label, value, onChange }) => (
  <Box
    component="div"
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      py: 0, // Vertical padding
    }}
  >
    <Typography>{label}</Typography>
    <Switch
      color="default"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      inputProps={{ "aria-label": label }}
    />
  </Box>
);

const ButtonSetting: React.FC<ButtonSettingProps> = ({ label, onClick }) => (
  <Box component="div" py={1}>
    <Button variant="contained" fullWidth onClick={onClick}>
      {label}
    </Button>
  </Box>
);

const OptionSetting: React.FC<OptionSettingProps> = ({ label, value, options, onChange }) => (
  <Box component="div" py={1}>
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={(e: SelectChangeEvent) => onChange(e.target.value)} label={label}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);

// Main SettingsPanel component
const SettingsPanel: React.FC = () => {
  const components = useComponentsContext();
  const [zoomOnSelection, setZoomOnSelection] = useState<boolean>(true);
  const [showFasteners, setShowFasteners] = useState<boolean>(true);
  const [showInstallations, setShowInstallations] = useState<boolean>(false);
  const [enableGrid, setEnableGrid] = useState<boolean>(false);

  useEffect(() => {
    // get all settings that are state
    const highlighter = components.get(OBF.Highlighter);
    setZoomOnSelection(highlighter.zoomToSelection);
    const tagger = components.get(ModelTagger);
    setShowFasteners(tagger.Configuration?.showFasteners ?? false);

    return () => {
      // unhook any changes
    };
  }, [components]);

  const handleZoomToggle = (checked: boolean) => {
    setZoomOnSelection(checked);
    const highlighter = components.get(OBF.Highlighter);
    highlighter.zoomToSelection = checked;
  };

  const handleGridToggle = (checked: boolean) => {
    setEnableGrid(checked);
    const grids = components.get(OBC.Grids).list;
    grids.forEach(grid => {
      grid.visible = checked})
  };

  const handleShowFastenersToggle = (checked: boolean) => {
    setShowFasteners(checked);
    const tagger = components.get(ModelTagger);
    const config = tagger.Configuration;
    if (config) {
      config.showFasteners = checked;
      tagger.Configuration = config;
    }
  };

  const handleShowInstallationsToggle = (checked: boolean) => {
    setShowInstallations(checked);
    const tagger = components.get(ModelTagger);
    const config = tagger.Configuration;
    if (config) {
      config.showInstallations = checked;
      tagger.Configuration = config;
    }
  };

  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        p: 2,
        "& > *": { mb: 2 },
      }}
    >
      <Typography variant="h6" gutterBottom>
        Selection Settings
      </Typography>

      <ToggleSetting
        label={zoomOnSelection ? "Zoom on Selected Enabled" : "Zoom on Selected Disabled"}
        value={zoomOnSelection}
        onChange={(e) => handleZoomToggle(e)}
      />

      <ToggleSetting
        label={enableGrid ? "Show Grid" : "Hide Grid"}
        value={enableGrid}
        onChange={(e) => handleGridToggle(e)}
      />

      <Divider />

      <Typography variant="h6" gutterBottom>
        Tag Settings
      </Typography>

      <ToggleSetting
        label={showFasteners ? "Show Fasteners" : "Hide Fasteners"}
        value={showFasteners}
        onChange={(e) => handleShowFastenersToggle(e)}
      />

      <ToggleSetting
        label={showInstallations ? "Show Installations" : "Hide Installations"}
        value={showInstallations}
        onChange={(e) => handleShowInstallationsToggle(e)}
      />

      <ButtonSetting
        label="Change Tag Colors"
        onClick={() => {
          components.get(ModelTagger).setupColors(false);
          if (components.get(ModelTagger).enabled) {
            components.get(ModelTagger).setTags();
          }
        }}
      />

      <Divider />

      {/* 

      <OptionSetting
        label="Theme"
        value="light"
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ]}
        onChange={(value: string) => console.log("Theme changed:", value)}
      /> */}

      {/* Add more settings here */}
    </Box>
  );
};

export default SettingsPanel;
