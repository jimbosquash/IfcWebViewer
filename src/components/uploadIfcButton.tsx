import {Button, useTheme} from "@mui/material";
import React, { useContext, useRef } from "react";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import {tokens} from "../theme"
import SetUpIfcComponents from "./setUpIfcComponents";
import * as THREE from "three"
import { MeshStandardMaterial } from "three";
import { ComponentsContext } from "../context/ComponentsContext";


async function LoadIfcFile(file: File, components: OBC.Components) : Promise<FRAGS.FragmentsGroup | undefined> {
    const fragmentIfcLoader = components.get(OBC.IfcLoader);
    await fragmentIfcLoader.setup();

    fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
    fragmentIfcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

    const loadedModel = await fragmentIfcLoader.load(new Uint8Array(await file.arrayBuffer()));
    loadedModel.name = file.name;

        for(var i = 0; i < loadedModel.children.length; i++)
                {

                    var child = loadedModel.children[i]
                    if(child instanceof THREE.InstancedMesh)
                    {
                        if(child.instanceColor !== null){
                            var oldColor = child.instanceColor.array;
                            var material = new MeshStandardMaterial();
                            material.color = new THREE.Color(oldColor[0],oldColor[1],oldColor[2]);
                            material.side = THREE.DoubleSide;
                            child.material = [material]
                        } 
                    }
                    else
                    {
                        console.log('not frag')
                    }
                }
    return loadedModel;
  }


  interface UploadIfcButtonProps {
      onIfcFileLoad: (model: FRAGS.FragmentsGroup | undefined) => void;
      setFileName: (name: string) => void;
  }
  
  const UploadIfcButton: React.FC<UploadIfcButtonProps> = ({ onIfcFileLoad, setFileName }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const components = useContext(ComponentsContext);
    //console.log("load testing component use",components)
  
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file && components) {
            console.log("Start loading IFC file:", file.name);
            const model = await LoadIfcFile(file, components); 
            if(onIfcFileLoad)
            {
                onIfcFileLoad(model);
            }
            setFileName(file.name)
        }
        else{
            console.log('failed to upload file due to missing data',components)
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
  