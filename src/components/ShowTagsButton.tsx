import { Icon } from "@iconify/react";
import { Button, IconButton, useTheme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { useComponentsContext } from "../context/ComponentsContext";
import { tokens } from "../theme";
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBF from "@thatopen/components-front";
import * as OBC from "@thatopen/components";
import { ModelCache } from "../bim-components/modelCache";
import * as REACT from "react";
import { useEffect, useRef, useState } from "react";
import { ModelTagger } from "../bim-components/modelTagger";
import { markProperties } from "../bim-components/modelTagger/src/Tag";

interface DynamicButtonProp {
  variant: "floating" | "panel";
}

// todo: add the listening for new geometry to tell marker component to updat its marker collection

export const ShowTagsButton: REACT.FC<DynamicButtonProp> = ({ variant }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [visibility, setVisibility] = useState<boolean>(false);
  const modelCache = useRef<ModelCache>();
  const [world, setWorld] = useState<OBC.World>();

  // add listeners for changing world
  useEffect(() => {
    if (!components) return;

    modelCache.current = components.get(ModelCache);
    modelCache.current.onWorldSet.add((data) => setWorld(data));
    return () => {
      modelCache?.current?.onWorldSet.remove((data) => setWorld(data));
    };
  }, [components]);


  // set up model tagger
  useEffect(() => {
    if (!components) return; 

    const tagger = components.get(ModelTagger);
    if(!world) {
      tagger.enabled = false;
      return;}

    tagger.world = world;
    tagger.enabled = true;
    // tagger.setVisibleAsync(visibility);
  }, [world]);

  
  const toggleComments = async () => {
    // go to components and disable
    if (!components) return;

    components.get(ModelTagger).visible = !visibility;
    setVisibility(!visibility);
  };

  const TagButtonIcon : React.FC<{ enabled: boolean }> =  ({enabled}) => {
    return(<>
      {!enabled ? <Icon icon="mdi:tag-off-outline" /> : <Icon icon="mdi:tag" />}
      </>
    )
  }

  return (
    <>
      <Tooltip title={ visibility ? "Hide Tags" : "Show Tags"}>
        {variant === "panel" ? (
          <Button
            sx={{ backgroundColor: "transparent" }}
            onClick={() => toggleComments()}
            style={{ color: colors.grey[400], border: "0" }}
          >
            <TagButtonIcon enabled={visibility} />
          </Button>
        ) : (
          <IconButton
            onClick={() => toggleComments()}
            style={{ color: colors.grey[400], border: "0" }}
          >
            <TagButtonIcon enabled={visibility} />
          </IconButton>
        )}
      </Tooltip>
    </>
  );
};



export default ShowTagsButton;
