import { Box, Button, ButtonGroup, Divider, useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { TreeNode } from "../../../../utilities/Tree";
import {
  BuildingElement,
  IfcElement,
  KnownGroupType,
  sustainerProperties,
  SelectionGroup,
} from "../../../../utilities/types";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import React from "react";
import { TreeUtils } from "../../../../utilities/treeUtils";
import MemoizedTreeTableRows from "./MemoizedTreeTableRows";
import {
  convertToBuildingElement,
  setVisibility,
  groupElementsByPropertyName,
} from "../../../../utilities/BuildingElementUtilities";
import { ViewableTree } from "../../../../bim-components/modelViewer/src/viewableTree";
import { IsolateButton, ToolBarButton } from "../../actionButtonPanel/src/IsolateButton";
import { tokens } from "../../../../theme";
import { Icon } from "@iconify/react";
import { PanelBase } from "../../../../components/PanelBase";

const treeName = ModelViewManager.stationTreeName;

export const StationBrowserPanel: React.FC = React.memo(() => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [nodes, setNodes] = useState<TreeNode<IfcElement>[]>();
  const [treeWithAssemblies, setTreeWithAssemblies] = useState<boolean>(false);
  const components = useComponentsContext();
  const [treeNavigation, setTreeNavigation] = useState<"stepOver" | "stepInto">("stepInto");

  const modelViewManager = useMemo(() => components?.get(ModelViewManager), [components]);

  // called on component change
  const getPropertyTree = useCallback(
    (tree: ViewableTree<IfcElement> | undefined) => {
      if (!tree || !modelViewManager) return;

      console.log("get existing tree, in event listener", tree, modelViewManager);
      if (!tree) return;

      // setNodeVisibility(tree.visibilityMap);
      console.log("building elements for assembly tree", [...tree.root.children.values()]);
      setNodes([...tree.root.children.values()]);
    },
    [modelViewManager]
  );

  useEffect(() => {
    if (!components) return;
    const existingTree = modelViewManager.getTree(treeName);

    if (existingTree !== undefined) {
      console.log("get existing tree", existingTree);
      getPropertyTree(existingTree);
    }
  }, [components, getPropertyTree]);

  const createRelevantAssemblyTree = () => {
    const newTree = addRelevantAssemblyNodes(modelViewManager.getTree(treeName));
    if (!newTree) {
      console.log("failed to create new tree");
    } else {
      console.log("created new tree", newTree);
      modelViewManager.setTree(newTree);
      modelViewManager.setMainTree(newTree.id);
      getPropertyTree(modelViewManager.getTree(newTree.id));
      setTreeWithAssemblies(true);
    }
  };

  /**
   * Assuming the tree is structured Station > BuildingStep > Element. we structure it Station > Assembly / BuildingStep > BuildingStep > Element.
   * By searching whether a building step should be grouped by its assembly name or not. resulting tree will have building steps and assmeblys at same branch depth.
   * @param tree
   * @returns
   */
  const addRelevantAssemblyNodes = (
    tree: ViewableTree<IfcElement> | undefined
  ): ViewableTree<IfcElement> | undefined => {
    if (!tree) return;
    const newTree = tree.duplicate();

    console.log("duplicated tree", newTree);

    const stationNodes = newTree.getNodes((node) => node.type === sustainerProperties.Station);

    stationNodes.forEach((station) => {
      // get all building elements
      const bElement = convertToBuildingElement(TreeUtils.getChildrenNonNullData(station));

      // remove building step and children nodes from tree
      const existingBuildingsteps = TreeUtils.getChildren(
        station,
        (node) => node.type === sustainerProperties.BuildingStep
      );
      existingBuildingsteps.forEach((node) => newTree.removeNode(node.id));
      console.log("pruned tree", newTree);

      const elementsByAssembly = groupElementsByPropertyName(bElement, sustainerProperties.Assembly);

      const stationSteps = new Map<string, BuildingElement[]>();
      const assemblyNodes: TreeNode<IfcElement>[] = [];

      // check if assembly has any buildingsteps relevant to display and create assemblies if so
      elementsByAssembly.forEach((elements, assemblyName) => {
        //group assembly elements by building step
        const elementsByStep = groupElementsByPropertyName(elements, sustainerProperties.BuildingStep);

        // check if step is in relevant list
        elementsByStep.forEach((stepElements, buildingStepName) => {
          const trimmedName = buildingStepName.split("_")[1];
          //console.log('building step in assembly', trimmedName)

          if (relevantBuildingSteps.find((step) => step === trimmedName)) {
            //console.log('found relevant building step, create assembly', trimmedName)
            // then should create an assembly and have this building step in the assembly

            // create new or find assembly
            const assemblyID = `${station.id}_${assemblyName}`;
            if (!assemblyNodes.find((assNode) => assNode.id === assemblyID)) {
              console.log(" assembly created", assemblyID);
              newTree.addNode(station.id, assemblyID, assemblyName, sustainerProperties.Assembly, null, false);
            }

            // create new building step
            const stepID = `${assemblyID}_${buildingStepName}`;
            console.log("building step created in assembly", stepID);

            newTree.addNode(assemblyID, stepID, buildingStepName, sustainerProperties.BuildingStep, null, false);

            // add all elements as children to building step
            stepElements.forEach((element) => {
              const elementID = `${stepID}_${element.expressID}`;
              newTree.addNode(stepID, elementID, element.name, KnownGroupType.BuildingElement, element, false);
            });
          } else {
            // Add this to the station building elements building step group for step grouping after
            const existingArray = stationSteps.get(buildingStepName) ?? [];
            stationSteps.set(buildingStepName, [...existingArray, ...stepElements]);
          }
        });
      });

      // now add elements not in assembly as building steps
      stationSteps.forEach((elements, stepName) => {
        // create new building step
        const stepID = `${station.id}_${stepName}`;
        newTree.addNode(station.id, stepID, stepName, sustainerProperties.BuildingStep, null, false);

        // add all elements as children to building step
        elements.forEach((element) => {
          const elementID = `${stepID}_${element.expressID}`;
          newTree.addNode(stepID, elementID, element.name, KnownGroupType.BuildingElement, element, false);
        });
      });
    });
    return newTree;
  };

  const relevantBuildingSteps: string[] = [
    "Gevel - Stijlen en Randregels",
    "Gevel - Afwerking - Binnenzijde en Dagkant",
    "Gevel - Beplating - Binnenzijde",
    "Gevel - Draaien",
    "Gevel - Installaties, Luchtdichting en Brandwerende Voorzieningen",
    "Gevel - Isolatie",
    "Gevel - Regels",
    "Gevel - Folie",
    "Gevel - Kozijnen",
    "Gevel - Achterrek en gevelafwerking",
    "Gevel - Plaatsen in module en koppelen installaties",
    "Woningscheidende wand - Stijlen en regels",
    "Woningscheidende wand - Beplating - Zijde 1",
    "Woningscheidende wand - Draaien",
    "Woningscheidende wand - Installaties en Brandwerende Voorzieningen",
    "Woningscheidende wand - Isolatie",
    "Woningscheidende wand - Folie",
    "Woningscheidende wand - Plaatsen in module en koppelen installaties",
    "Woningscheidende wand - Beplating - Overig en Deurstijlen",
    "Woningscheidende wand - Beplating - Afwerking en Tegelwerk",
    "Binnenwand - Stijlen en regels",
    "Binnenwand - Beplating - Zijde 1",
    "Binnenwand - Draaien",
    "Binnenwand - Installaties en Brandwerende Voorzieningen",
    "Binnenwand - Isolatie",
    "Binnenwand - Beplating - Zijde 2",
    "Binnenwand - Plaatsen in module en koppelen installaties",
    "Binnenwand - Beplating - Overig en Deurstijlen",
    "Binnenwand - Beplating - Afwerking en Tegelwerk",
  ];

  const toggleTreeNavigation = () => {
    const currentNavigation = components.get(ModelViewManager).configuration.get("treeNavigation");

    const newNavigation = currentNavigation === "stepOver" ? "stepInto" : "stepOver";
    components.get(ModelViewManager).configuration.set("treeNavigation", newNavigation);
    setTreeNavigation(newNavigation);
  };

  const createStationTree = () => {
    const newTree = removeAssemblyNodes(modelViewManager.getTree(treeName));
    if (!newTree) {
      console.log("failed to create new tree", treeName, modelViewManager);
    } else {
      console.log("created new tree", newTree);
      modelViewManager.setTree(newTree);
      modelViewManager.setMainTree(newTree.id);
      getPropertyTree(modelViewManager.getTree(newTree.id));
    }

    setTreeWithAssemblies(false);
  };

  const removeAssemblyNodes = (tree: ViewableTree<IfcElement> | undefined): ViewableTree<IfcElement> | undefined => {
    if (!tree) return;

    const newTree = tree.duplicate();
    // foreach station add building step nondes and children
    newTree
      .getNodes((node) => node.type === sustainerProperties.Station)
      .forEach((station) => {
        // get all building elements
        const bElement = convertToBuildingElement(TreeUtils.getChildrenNonNullData(station));

        // remove building step and assembly nodes from tree
        const existingAssemblies = TreeUtils.getChildren(
          station,
          (node) => node.type === sustainerProperties.Assembly || node.type === KnownGroupType.BuildingStep
        );
        existingAssemblies.forEach((node) => newTree.removeNode(node.id));
        console.log("pruned tree", newTree);

        const stepNodeIDs: string[] = [];

        // check if building step has any buildingsteps relevant to display and create assemblies if so
        groupElementsByPropertyName(bElement, sustainerProperties.BuildingStep).forEach((elements, stepName) => {
          // create new or find assembly
          const stepID = `${station.id}_${stepName}`;
          if (!stepNodeIDs.find((sNode) => sNode === stepID)) {
            console.log(" step created", stepID);
            newTree.addNode(station.id, stepID, stepName, sustainerProperties.BuildingStep, null, false);
            stepNodeIDs.push(stepID);
          }

          // add all elements as children to building step
          elements.forEach((element) => {
            const elementID = `${stepID}_${element.expressID}`;
            newTree.addNode(stepID, elementID, element.name, KnownGroupType.BuildingElement, element, false);
          });
        });
      });
    setTreeWithAssemblies(true);

    return newTree;
  };

  // make visible on double click
  const handleDoubleClick = useCallback(
    (node: TreeNode<IfcElement>) => {
      if (!node || !components) return;
      console.log("double click");
      const elements = convertToBuildingElement(TreeUtils.getChildrenNonNullData(node));
      setVisibility(elements, components, true);

      if (modelViewManager?.SelectedGroup?.groupName === node.name) {
        console.log("set selection ending early, selection has matching name");
        return;
      }

      const selectedGroup: SelectionGroup = {
        id: node?.id,
        groupType: node.type,
        groupName: node.name,
        elements: elements,
      };
      modelViewManager.setSelectionGroup(selectedGroup, true, treeName, true);
    },
    [components]
  );

  return (
    <>
      <PanelBase
        title="Work stations"
        icon="mdi:file-tree-outline"
        body="Building elements grouped by work station and building steps. Double click to select."
        buttonBar={<ButtonGroup
          variant="text"
          style={{
            flexShrink: 0,
            // marginLeft: "8px",
            // marginTop: "18px",
            // marginBottom: "10px",
            justifyContent: "center",
          }}
        >
          <ToolBarButton
            onClick={() => (treeWithAssemblies ? createStationTree() : createRelevantAssemblyTree())}
            content={treeWithAssemblies ? "Remove Assemblies" : "Add Assemblies"}
            toolTip={"add or remove grouping by relevant assemblies"}
          />
          {/* <ToolBarButton
                  onClick={() => (treeWithAssemblies ? createStationTree() : createRelevantAssemblyTree())}
                  content={<Icon icon="material-symbols:step-over" />}
                  toolTip={'Step over - navigate across tree structure'}
                /> */}
          <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

          <ToolBarButton
            onClick={() => toggleTreeNavigation()}
            content={
              treeNavigation === "stepOver" ? (
                <Icon icon="material-symbols:step-over" />
              ) : (
                <Icon icon="material-symbols:step-into" />
              )
            }
            toolTip={
              treeNavigation === "stepOver"
                ? "Step over - navigate tree with same type"
                : "Step in - navigate into tree structure"
            }
          />
        </ButtonGroup>
        }
      >
        <div
          style={{
            alignContent: "center",
            top: "0%",
            left: 0,
            zIndex: 50,
            width: "100%",
          }}
        >
          {/* fixed panel section */}


          <Box component="div" m="0px" maxHeight="100%" overflow="hidden" width="100%">
            <MemoizedTreeTableRows onDoubleClick={handleDoubleClick} nodes={nodes} treeName={treeName} />
          </Box>
        </div>
      </PanelBase>
    </>
  );
});

export default StationBrowserPanel;
