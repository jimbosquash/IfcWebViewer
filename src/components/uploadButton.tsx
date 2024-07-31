import { Button, useTheme } from "@mui/material";
import * as OBC from "@thatopen/components";
import { useContext } from "react";
import { ComponentsContext } from "../context/ComponentsContext";
import { uploadIfcFromUserInput } from "../bim-components/src/uploadButton";
import { ModelCache } from "../bim-components/modelCache";
import { tokens } from "../theme";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";


export const FloatingUploadIfcButton: React.FC = () => {
    const components = useContext(ComponentsContext);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    
    const handleClick = () => {
        if(!components) return;   
        uploadIfcFromUserInput(components.get(OBC.IfcLoader),components.get(ModelCache))
    }
    
    
    return(
        <div>
            <Button
                  onClick={handleClick}
                  sx={{
                      backgroundColor: colors.blueAccent[700],
                      color: colors.grey[100],
                      fontSize: "14px",
                      fontWeight: "bold",
                      padding: "10px 20px",
                  }}>
                  <UploadOutlinedIcon sx={{ mr: "10px" }} />
                  Upload .IFC
              </Button>
        </div>

    )
}