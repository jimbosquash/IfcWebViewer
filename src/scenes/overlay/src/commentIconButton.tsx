import * as BUI from "@thatopen/ui";
import * as OBF from "@thatopen/components-front";
import * as OBC from "@thatopen/components";

import { Button, useTheme } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { Comments } from "../../../bim-components/comments";
import { Comment } from "../../../bim-components/comments/src/commet";
import { ModelCache } from "../../../bim-components/modelCache";
import { Icon } from "@iconify/react";
import { tokens } from "../../../theme";

export const CommentIconButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCommentsEnabled, setIsCommentsEnabled] = useState(false);
  const components = useComponentsContext();
  const modelCache = useRef<ModelCache>();
  const [world, setWorld] = useState<OBC.World>();

  useEffect(() => {
    if (!components) return;

    modelCache.current = components.get(ModelCache);
    modelCache.current.onWorldSet.add((data) => setWorld(data));
    return () => {
      modelCache?.current?.onWorldSet.remove((data) => setWorld(data));
    };
  }, [components]);

  useEffect(() => {
    if (!components || !world) return;

    const comments = components.get(Comments);
    comments.world = world;
    comments.enabled = isCommentsEnabled;

    comments.onCommentAdded.add((comment) => {
      if (!comment.position || !world) return;

      const commentBubble = createCommentBubble(comment);

      const commentMark = new OBF.Mark(world, commentBubble);
      commentMark.three.position.copy(comment.position);
    });
  }, [world]);

  const toggleComments = () => {
    // go to components and disable
    if (!components) return;

    const comments = components.get(Comments);
    comments.enabled = !isCommentsEnabled;
    setIsCommentsEnabled(!isCommentsEnabled);
  };

  const createCommentBubble = (comment: Comment) => {
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
      const comments = components.get(Comments);
      comments.enabled = false;
      setIsCommentsEnabled(false);
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
  };

  return (
    <>
      <Button
        onClick={toggleComments}
        sx={{ backgroundColor: "transparent" }}
        style={{ color: colors.grey[400], border: "0" }}
      >
        {isCommentsEnabled ? <Icon icon="mdi:chat-add" /> : <Icon icon="mdi:chat-add-outline" />}
      </Button>
    </>
  );
};
