import { ZoomInMapOutlined } from "@mui/icons-material";
import { Tooltip, Button, useTheme } from "@mui/material";

import { useEffect, useState } from "react";
import { tokens } from "../../../theme";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { ModelCache } from "../../../bim-components/modelCache";
import { useComponentsContext } from "../../../context/ComponentsContext";

export const PlanViewButton = () => {
  const components = useComponentsContext();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const setCamView = () => {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;

    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    cam.projection.set("Orthographic");
    cam.set("Plan" as OBC.NavModeID);

    const bbox = new THREE.Box3().setFromObject(cache.world.scene.three);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    // console.log("cam bbox center:", center.x,center.y,center.z);

    // Calculate the larger of width and depth for optimal framing
    const maxSize = Math.max(size.x, size.z);

    // Set camera position
    const cameraHeight = Math.max(size.y, maxSize) * 2; // Ensure camera is high enough
    cam.controls.setPosition(center.x, center.y + cameraHeight, center.z, false);
    console.log("cam position center:", center.x, center.y + cameraHeight, center.z);

    // Set camera target to look at the center
    cam.controls.setTarget(center.x, center.y, center.z, false);
    console.log("cam target center:", center.x, center.y, center.z);

    // cam.controls.up

    // cam.fit(cache.world?.meshes, 0.5);
    // console.log("cam mode setting:", cam.mode.id, cam.mode.enabled);
  };
  return (
    <>
      <Tooltip title="Plan View">
        <Button
          sx={{ backgroundColor: colors.primary[400] }}
          onClick={() => setCamView()}
          style={{ color: colors.grey[400], border: "0" }}
          //   variant={open ? "contained" : "outlined"}
        >
          <ZoomInMapOutlined />
        </Button>
      </Tooltip>
    </>
  );
};
