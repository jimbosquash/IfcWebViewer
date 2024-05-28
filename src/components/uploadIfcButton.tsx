import {Button, useTheme} from "@mui/material";
import React, { useRef } from "react";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import * as OBC from "openbim-components";
import * as FRAGS from "bim-fragment";
import {tokens} from "../theme"
import SetUpIfcComponents from "./setUpIfcComponents";


async function readIfcFile(file: File, containerRef : React.RefObject<HTMLElement | undefined>) : Promise<FRAGS.FragmentsGroup | undefined> {
    const components = SetUpIfcComponents(containerRef);
    //components.uiEnabled = false;
    let fragmentLoader = components.tools.get(OBC.FragmentIfcLoader);
    fragmentLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

    const loadedModel = await fragmentLoader.components.tools.get(OBC.FragmentIfcLoader).load(new Uint8Array(await file.arrayBuffer()));
    components.tools.get(OBC.IfcPropertiesProcessor).process(loadedModel);
    //console.log(foundElements);
    return loadedModel;
  }


  interface UploadIfcButtonProps {
      onIfcFileLoad: (model: any) => void;
      setFileName: (name: string) => void;
  }
  
  const UploadIfcButton: React.FC<UploadIfcButtonProps> = ({ onIfcFileLoad, setFileName }) => {
      const containerRef = useRef<HTMLElement>(null);
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
  
      const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files ? event.target.files[0] : null;
          if (file) {
              console.log("Start loading IFC file:", file.name);
              const loadedModel = await readIfcFile(file, containerRef); 
              console.log(onIfcFileLoad)
              if(onIfcFileLoad)
                onIfcFileLoad(loadedModel);
              setFileName(file.name)
          }
      };
  
      const handleClick = () => {
          document.getElementById('ifcFileInput')?.click();
      };
  
      return (
          <div>
              <input
                  type="file"
                  id="ifcFileInput"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".ifc"
              />
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
      );
  };
  
  export default UploadIfcButton;
  