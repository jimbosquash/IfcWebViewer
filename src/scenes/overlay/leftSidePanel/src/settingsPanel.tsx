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
  SelectChangeEvent,
  Divider,
} from "@mui/material";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { ModelTagger } from "../../../../bim-components/modelTagger";
import { ConfigurationManager } from "../../../../bim-components/configManager";

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
  const [mergeFasteners, setMergeFasteners] = useState<boolean>(true);
  const [showInstallations, setShowInstallations] = useState<boolean>(false);
  const [labelStyle, setLabelStyle] = useState<"Code" | "Name" | "Alias">("Code");
  const [showGrid, setShowGrid] = useState<boolean>(false);

  const labelOptions = ["Code", "Name", "Alias"]; // List of possible label styles


  useEffect(() => {
    // get all settings that are state
    const highlighter = components.get(OBF.Highlighter);
    setZoomOnSelection(highlighter.zoomToSelection);
    setShowGrid(components.get(ConfigurationManager).sceneConfig.get("showGrid"));

    const tagConfigs = components.get(ModelTagger).Configuration;
    setLabelStyle(tagConfigs.get("labelStyle"));
    setShowFasteners(tagConfigs.get("showFasteners"));
    setMergeFasteners(tagConfigs.get("mergeFasteners"));
    setShowInstallations(tagConfigs.get("showInstallations"));
    return () => {
      // unhook any changes
    };
  }, [components]);

  const handleZoomToggle = (checked: boolean) => {
    setZoomOnSelection(checked);
    components.get(ConfigurationManager).sceneConfig.set("zoomToSelection", checked);
    components.get(OBF.Highlighter).zoomToSelection = checked;
  };

  const handleGridToggle = (checked: boolean) => {
    setShowGrid(checked);
    components.get(ConfigurationManager).sceneConfig.set("showGrid", checked);
    const grids = components.get(OBC.Grids).list;
    grids.forEach((grid) => {
      grid.visible = checked;
    });
  };

  const handleLabelStyleChange = (newValue: string) => {
    console.log(`Label style changed to: ${newValue}`);
    if(!(newValue === 'Name' || newValue === 'Code' || newValue === 'Alias')) return;
    setLabelStyle(newValue);
    console.log(`Label style changed to: ${newValue}`);
    components.get(ModelTagger).Configuration.set("labelStyle", newValue);

  };

  const handleShowFastenersToggle = (checked: boolean) => {
    setShowFasteners(checked);
    components.get(ModelTagger).Configuration.set("showFasteners", checked);
  };

  const handleMergeFastenersToggle = (checked: boolean) => {
    setMergeFasteners(checked);
    components.get(ModelTagger).Configuration.set("mergeFasteners", checked);
  };

  const handleShowInstallationsToggle = (checked: boolean) => {
    setShowInstallations(checked);
    components.get(ModelTagger).Configuration.set("showInstallations", checked);
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
        label={showGrid ? "Show Grid" : "Hide Grid"}
        value={showGrid}
        onChange={(e) => handleGridToggle(e)}
      />

      <Divider />

      <Typography variant="h6" gutterBottom>
        Tag Settings
      </Typography>
{/* 
      <ToggleSetting
        label={`Show label as ${labelStyle}`}
        value={labelStyle === "Code"}
        onChange={(e) => handleLabelStyleToggle(e)}
      />
       */}
            <DropdownSetting
        label={`Show label as ${labelStyle}`}
        options={labelOptions}
        value={labelStyle}
        onChange={handleLabelStyleChange}
      />

      <ToggleSetting
        label={showFasteners ? "Show Fasteners" : "Hide Fasteners"}
        value={showFasteners}
        onChange={(e) => handleShowFastenersToggle(e)}
      />
      <ToggleSetting
        label={mergeFasteners ? "UnMerge Fasteners" : "Merge Fasteners"}
        value={mergeFasteners}
        onChange={(e) => handleMergeFastenersToggle(e)}
      />

      <ToggleSetting
        label={showInstallations ? "Show Installations" : "Hide Installations"}
        value={showInstallations}
        onChange={(e) => handleShowInstallationsToggle(e)}
      />

      <ButtonSetting
        label="Change Tag Colors"
        onClick={() => {
          components.get(ModelTagger).setupMaps(false);
          if (components.get(ModelTagger).enabled) {
            components.get(ModelTagger).setup();
            components.get(ModelTagger).setMarkerProps();
          }
        }}
      />

      <Divider />

      <Box component="div" py={1}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            localStorage.clear();
          }}
        >
          Clear local storage
        </Button>
      </Box>

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

interface DropdownSettingProps {
  label: string;
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
}

const DropdownSetting: React.FC<DropdownSettingProps> = ({ label, options, value, onChange }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          cursor: "pointer",
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SettingsPanel;
