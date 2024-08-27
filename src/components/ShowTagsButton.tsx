import { Icon } from "@iconify/react";
import { Button, IconButton, useTheme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { useComponentsContext } from "../context/ComponentsContext";
import { tokens } from "../theme";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { ModelCache } from "../bim-components/modelCache";
import * as REACT from "react";
import { useState } from "react";

interface DynamicButtonProp {
  variant: "floating" | "panel";
}

export const ShowTagsButton: REACT.FC<DynamicButtonProp> = ({ variant }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [enabled, setEnabled] = useState<boolean>(false);



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

  const toggleTagDisplay = () => {
    if(enabled)
    {
        setEnabled(false);
        clearTags();
    } else  {
        setEnabled(true);
        setupTags();
    }
  }

  const clearTags = () => {
    throw new Error("Function not implemented.");
}

const setupTags = () => {

    if(!components) return;

    const fragments = components.get(OBC.FragmentsManager)
    // get all visible elements in the scene

    fragments.groups.forEach(model => {
        console.log("children",model.children)

        // go through all children and get items that are not hidden


        // const fragments = model.getFragmentMap();
        // const elementsForModel = elementsByModelId.get(model.uuid);
        // if (elementsForModel) {
        //     const allFragments = GetFragmentsFromExpressIds(elementsForModel.map(element => element.expressID), fragments, model);
        //     if (visibility === VisibilityState.Visible) {
        //         allFragments.forEach((ids, frag) => frag.setVisibility(true, ids));
        //         // allFragments.forEach((ids, frag) => frag.resetColor(ids));
        //     }
        //     else {
        //         allFragments.forEach((ids, frag) => frag.setVisibility(false, ids));
        //         // allFragments.forEach((ids, frag) => frag.setColor(transWhite, ids));
        //     }
        // }
    });



}

  return (
    <>
      <Tooltip title="Orthogonal View">
        {variant === "panel" ? (
          <Button
            sx={{ backgroundColor: "transparent" }}
            onClick={() => toggleTagDisplay()}
            style={{ color: colors.grey[400], border: "0" }}
            //   variant={open ? "contained" : "outlined"}
          >
            {!enabled ? <Icon icon="ph:tag-bold" /> : <Icon icon="ph:tag-duotone" />}
          </Button>
        ) : (
          <IconButton
            onClick={() => toggleTagDisplay()}
            style={{ color: colors.grey[400], border: "0" }}
            //   variant={open ? "contained" : "outlined"}
          >
            {!enabled ? <Icon icon="ph:tag-bold" /> : <Icon icon="ph:tag-duotone" />}
          </IconButton>
        )}
      </Tooltip>
    </>
  );
};

export default ShowTagsButton;


