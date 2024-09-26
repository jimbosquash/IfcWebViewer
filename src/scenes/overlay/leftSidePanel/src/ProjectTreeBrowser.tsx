import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";

import { TreeNode } from "../../../../utilities/Tree";
import { BuildingElement, IfcElement, VisibilityState } from "../../../../utilities/types";
import { ModelCache } from "../../../../bim-components/modelCache";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import TreeTableRow from "../../../../components/TreeTableRow";
import { buildTree } from "../../../../utilities/IfcUtilities";

// const treeID = "MaterialTree";

export const ProjectTreeBrowser: React.FC = () => {
  const [nodes, setNodes] = useState<TreeNode<IfcElement>[]>();
  const [nodeVisibility, setNodeVisibility] = useState<Map<string, VisibilityState>>(); // key = node.id, value = visibility state
  const [visibleOnDoubleClick, setVisibleOnDoubleClick] = useState<boolean>(true);
  const components = useComponentsContext();

  useEffect(() => {
    // now remove top tree as its project
    const cache = components.get(ModelCache);
    cache.onModelAdded.add((model) => handleLoadedModel(model));
    if (cache.models()) {
      handleLoadedModel(cache.models()[0]);
    }

    return () => {
      cache.onModelAdded.remove((model) => handleLoadedModel(model));
    };
  }, [components]);

  //todo: should handle if multiple models are in use
  async function handleLoadedModel(model: FRAGS.FragmentsGroup): Promise<void> {
    const cache = components.get(ModelCache);
    if (!cache.BuildingElements) return;

    const indexer = components.get(OBC.IfcRelationsIndexer);
    await indexer.process(model);

    const tree = await buildTree(cache.BuildingElements, model, indexer);
    const treeContainer = components.get(ModelViewManager).addOrReplaceTree(tree.id, tree);

    setNodeVisibility(treeContainer.visibilityMap);
    setNodes([...tree.root.children.values()]);
  }

  return (
    <>
      <div
        style={{
          alignContent: "stretch",
          top: "0%",
          left: 0,
          zIndex: 50,
          width: "100%",
        }}
      >
        {/* fixed panel section */}
        {nodes && <RichTreeView items={nodes} getItemLabel={(item) => item.name} />}
      </div>
    </>
  );
};

export default ProjectTreeBrowser;
