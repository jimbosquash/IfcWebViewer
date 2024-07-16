import * as BUI from "@thatopen/ui";
import * as OBF from "@thatopen/components-front";

import { IconButton } from "@mui/material"
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import ChatBubbleRounded from "@mui/icons-material/ChatBubbleRounded";
import { useState, useContext, useEffect } from "react";
import { ComponentsContext } from "../../../context/ComponentsContext";
import { Comments } from "../../../bim-components/comments";
import { useModelContext } from "../../../context/ModelStateContext";

// todo find out how to pss down styles from parent container on buttons ... maybe
export const CommentIconButton = () => {
    const [isCommentsEnabled, setIsCommentsEnabled] = useState(false);
    const components = useContext(ComponentsContext);
    const modelState = useModelContext();
  
  useEffect(() => {
    if (!components || !modelState?.currentWorld) return;

    const comments = components.get(Comments);
    comments.world = modelState.currentWorld;
    comments.enabled = isCommentsEnabled;

    comments.onCommentAdded.add((comment) => {
      if (!comment.position || !modelState.currentWorld) return;
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

      const commentMark = new OBF.Mark(modelState.currentWorld, commentBubble);
      commentMark.three.position.copy(comment.position);
    });
  }, [modelState?.currentWorld]);

  const toggleComments = () => {
    // go to components and disable
    if (!components) return;

    const comments = components.get(Comments);
    comments.enabled = !isCommentsEnabled;
    setIsCommentsEnabled(!isCommentsEnabled);

  };

    return (
        <>
        <IconButton onClick={toggleComments}>
              {isCommentsEnabled ? (
                <ChatBubbleRounded />
              ) : (
                <ChatBubbleOutlineRounded />
              )}
            </IconButton>
        </>
    )
}