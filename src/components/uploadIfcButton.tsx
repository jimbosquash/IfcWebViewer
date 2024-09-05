import { Button, useTheme } from "@mui/material";
import { useComponentsContext } from "../context/ComponentsContext";
import { tokens } from "../theme";
import { uploadIfcFromUserInput } from "../utilities/IfcFileLoader";

export const UploadIfcButton: React.FC = () => {
  const components = useComponentsContext();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <div>
      <Button
        onClick={() => uploadIfcFromUserInput(components)}
        size="small"
        sx={{
          backgroundColor: theme.palette.mode !== "dark" ? tokens("light").blueAccent[400] : tokens("dark").blueAccent[400],
          color: theme.palette.mode !== "dark" ? tokens("light").blueAccent[900] : tokens("dark").blueAccent[900],
          fontWeight: "bold",
          padding: "2px 10px",
        }}
      >
        Upload .IFC
      </Button>
    </div>
  );
};

export default UploadIfcButton;
