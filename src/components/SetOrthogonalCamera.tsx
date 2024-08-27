import { Icon } from "@iconify/react";
import { Button, IconButton, useTheme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { useComponentsContext } from "../context/ComponentsContext";
import { tokens } from "../theme";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { ModelCache } from "../bim-components/modelCache";
import * as REACT from 'react'

interface DynamicButtonProp {
    variant: "floating" | "panel"
}

export const SetOrthogonalCamera : REACT.FC<DynamicButtonProp> = ({variant}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();

  const setCamView = async () => {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;

    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    //cam.projection.set("Orthographic");
    //cam.set("Plan" as OBC.NavModeID);

    const bbox = new THREE.Box3().setFromObject(cache.world.scene.three);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    // Calculate the larger of width and depth for optimal framing
    const maxSize = Math.max(size.x, size.z);

    // Set camera position
    const cameraHeight = maxSize * 5; // Ensure camera is high enough

    // Calculate the distance the camera should be from the center of the bounding box
    const maxDim = Math.max(size.x, size.y, size.z);
    //const fov = cam.three.fov * (Math.PI / 180); // convert vertical fov to radians

    let cameraDistance = maxDim; /// (2 * Math.tan(fov / 2));

    // Add some padding to the distance
    cameraDistance *= 1.2;

    // Set camera target to look at the center
    cam.controls.camera.up.set(0, 1, 0);
    // cam.controls.camera.up.set(size.x > size.z ? 0 : 1, 1, 0);

    const calc = cameraDistance / Math.sqrt(2);
    await cam.controls.setLookAt(
      center.x + calc,
      center.y + calc,
      center.z + calc,
      center.x,
      center.y,
      center.z,
      false
    );
    // console.log("cam target center:", center.x, center.y, center.z);

    zoomAll;
  };

  const zoomAll = () => {
    if (!components) return;
    const cache = components.get(ModelCache);
    if (!cache.world) return;

    setTimeout(async () => {
      if (!cache.world?.meshes || cache.world.meshes.size === 0) return;
      let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
      await cam.fit(cache.world?.meshes, 0.5);
    }, 50);
  };

  return (
    <>
      <Tooltip title="Orthogonal View">

        {variant === "panel" ? <Button
          sx={{ backgroundColor: "transparent" }}
          onClick={() => setCamView()}
          style={{ color: colors.grey[400], border: "0" }}
          //   variant={open ? "contained" : "outlined"}
        >
          <Icon icon="solar:box-minimalistic-outline" />{" "}
        </Button> 
        :
        <IconButton
          onClick={() => setCamView()}
          style={{ color: colors.grey[400], border: "0" }}
          //   variant={open ? "contained" : "outlined"}
        >
          <Icon icon="solar:box-minimalistic-outline" />{" "}
        </IconButton> 
        }
      </Tooltip>
    </>
  );
};

export default SetOrthogonalCamera;
