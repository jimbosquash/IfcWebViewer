import * as BUI from "@thatopen/ui";
import * as OBF from "@thatopen/components-front";
import * as OBC from "@thatopen/components";

import { IconButton } from "@mui/material"
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import ChatBubbleRounded from "@mui/icons-material/ChatBubbleRounded";
import { useState, useContext, useEffect, useRef } from "react";
import { ComponentsContext } from "../../../context/ComponentsContext";
import { Comments } from "../../../bim-components/comments";
import { Comment } from "../../../bim-components/comments/src/commet";
import { ModelCache } from "../../../bim-components/modelCache";

export const CommentIconButton = () => {
    const [isCommentsEnabled, setIsCommentsEnabled] = useState(false);
    const components = useContext(ComponentsContext);
    const modelCache = useRef<ModelCache>();
    const [world,setWorld] = useState<OBC.World>();

    useEffect(() => {
      if(!components) return;
  
      modelCache.current =  components.get(ModelCache);
      modelCache.current.onWorldSet.add((data) => setWorld(data))
      return () => {
        modelCache?.current?.onWorldSet.remove((data) => setWorld(data))
      }
    }, [components])
    

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