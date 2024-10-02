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
  const [enabled, setEnabled] = useState<boolean>(false);
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
    if (!components || !world) return;

    const tagger = components.get(ModelTagger);
    tagger.world = world;
    tagger.enabled = enabled;

    // tagger.onTagAdded.add((tag) => {
    //   if (!tag.position || !world) return;

    //   const tagBubble = createTagBubble(tag);

      
    //   const commentMark = new OBF.Mark(world, tagBubble);
    //   commentMark.three.position.copy(tag.position);
    // });
  }, [world]);

  const createTagBubble = (comment: markProperties) => {

    const commentBubble = BUI.Component.create(() => {
      const commentsTable = document.createElement("bim-table");
      console.log("creating comment", commentsTable);
      commentsTable.headersHidden = true;
      commentsTable.expanded = true;

      const setTableData = () => {
        const groupData: BUI.TableGroupData = {
          data: { Comment: comment.text },
        };

        commentsTable.data = [groupData];
      };

      setTableData();
      const tagger = components.get(ModelTagger);
      tagger.enabled = false;
      setEnabled(false);
      return BUI.html`
      <div>
        <bim-panel style="min-width: 0; max-width: 20rem; max-height: 20rem; border-radius: 1rem;">
          <bim-panel-section icon="material-symbols:comment" collapsed>
            ${commentsTable}
            <bim-button label="Add reply"></bim-button>
          </bim-panel-section>
        </bim-panel> 
      </div>
      `;
    });

    return commentBubble;
  }

  
  const toggleComments = () => {
    // go to components and disable
    if (!components) return;

    const tagger = components.get(ModelTagger);
    tagger.enabled = !enabled;
    //tagger.visible = !enabled;
    setEnabled(!enabled);
  };



  const toggleTagDisplay = () => {
    const highlighter = components.get(OBF.Highlighter);
    if (enabled) {

      setEnabled(false);
      highlighter.onAfterUpdate.remove((data) => tagHighlighted(data));
      clearTags();
    } else {
      setEnabled(true);
      highlighter.onAfterUpdate.add((data) => tagHighlighted(data));
      highlighter.onBeforeUpdate.add(() => console.log("highlightUpdate"));
      setupTags();
    }
    console.log('highlight state', enabled);

  };

  const clearTags = () => {
    throw new Error("Function not implemented.");
  };

  const setupTagsForHover = () => {
    if (!components) return;

    const highlighter = components.get(OBF.Highlighter);

    highlighter.onAfterUpdate.add((data) => tagHighlighted(data));
  };

  const tagHighlighted = (highlighter: OBF.Highlighter) => {
    console.log('highlight', highlighter.selection);
  };

  const setupTags = () => {
    if (!components) return;

    const fragments = components.get(OBC.FragmentsManager);
    // get all visible elements in lthe scene

    fragments.groups.forEach((model) => {
      console.log("children", model);
      // go through all children and get items that are not hidden

      model.children.forEach(child => {
        // each child is an instance mesh or a type mesh.
        // the children will have references to its instances and visibility
        child.visible
      })

    });
  };

  const TagButtonIcon : React.FC<{ enabled: boolean }> =  ({enabled}) => {
    return(<>
      {!enabled ? <Icon icon="mdi:tag-off-outline" /> : <Icon icon="mdi:tag" />}
      </>
    )
  }

  return (
    <>
      <Tooltip title={ enabled ? "Hide Tags" : "Show Tags"}>
        {variant === "panel" ? (
          <Button
            sx={{ backgroundColor: "transparent" }}
            onClick={() => toggleComments()}
            style={{ color: colors.grey[400], border: "0" }}
          >
            <TagButtonIcon enabled={enabled} />
          </Button>
        ) : (
          <IconButton
            onClick={() => toggleComments()}
            style={{ color: colors.grey[400], border: "0" }}
          >
            <TagButtonIcon enabled={enabled} />
          </IconButton>
        )}
      </Tooltip>
    </>
  );
};



export default ShowTagsButton;
