import { ZoomInMapOutlined } from "@mui/icons-material";
import { Tooltip, Button, useTheme } from "@mui/material";

import { tokens } from "../../../../theme";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { ModelCache } from "../../../../bim-components/modelCache";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Icon } from "@iconify/react";

export const PlanViewButton = () => {
  const components = useComponentsContext();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const setCamView = async () => {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;

    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    cam.projection.set("Orthographic");
    cam.set("Plan" as OBC.NavModeID);

    const bbox = new THREE.Box3().setFromObject(cache.world.scene.three);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    // Calculate the larger of width and depth for optimal framing
    const maxSize = Math.max(size.x, size.z);

    // Set camera position
    const cameraHeight = maxSize * 5; // Ensure camera is high enough

    // Set camera target to look at the center
    cam.controls.camera.up.set(size.x > size.z ? 0 : 1, 1, 0);
    await cam.controls.setLookAt(center.x, cameraHeight, center.z, center.x, center.y, center.z, false);
    console.log("cam target center:", center.x, center.y, center.z);
    zoomAll();
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
      <Tooltip title="Plan View">
        <Button
          sx={{ backgroundColor: "transparent" }}
          onClick={() => setCamView()}
          style={{ color: colors.grey[400], border: "0" }}
          //   variant={open ? "contained" : "outlined"}
        >
          <Icon icon="mdi:floor-plan" />{" "}
        </Button>
      </Tooltip>
    </>
  );
};
