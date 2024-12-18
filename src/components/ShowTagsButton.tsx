import { Icon } from "@iconify/react";
import { useComponentsContext } from "../context/ComponentsContext";
import * as OBC from "@thatopen/components";
import { ModelCache } from "../bim-components/modelCache";
import { useEffect, useRef, useState } from "react";
import { ModelTagger } from "../bim-components/modelTagger";
import { ToolBarButton } from "../scenes/overlay/actionButtonPanel/src/toolbarButton";

export const ShowTagsButton = () => {
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
    if (!world) {
      tagger.enabled = false;
      return;
    }

    tagger.world = world;
    tagger.enabled = true;
  }, [world]);


  const toggleComments = async () => {
    // go to components and disable
    if (!components) return;

    components.get(ModelTagger).visible = !visibility;
    setVisibility(!visibility);
  };

  return (
    <>
      <ToolBarButton
        toolTip={visibility ? "Hide Tags" : "Show Tags"}
        onClick={() => toggleComments()}
        content={!visibility ? <Icon icon="mdi:tag-off-outline" /> : <Icon icon="mdi:tag" />}

      />
    </>
  );
};



export default ShowTagsButton;
