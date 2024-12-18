import React, { useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Box, Button, ButtonGroup, Chip, IconButton, Typography } from "@mui/material";
import { BuildingElement, IfcElement, sustainerProperties } from "../../../../utilities/types";
import { TreeNode } from "../../../../utilities/Tree";
import { HVACViewer } from "../../../../bim-components/hvacViewer";
import TreeTableRow from "../../../../components/TreeTableRow";
import { PanelBase } from "../../../../components/PanelBase";
import RowContent from "../../../../components/RowContent";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const treeID = 'installationTree'

export const InstallationHelperPanel = () => {
    const components = useComponentsContext();
    const [prefabNodes, setPrefabNodes] = useState<TreeNode<IfcElement>[]>();
    const [otherNodes, setOtherNodes] = useState<TreeNode<IfcElement>[]>();
    const [SelectedNode, setSelectedNode] = useState<TreeNode<IfcElement>>();
    const [selected, setSelected] = useState<sustainerProperties | null>(null);

    const hvacViewer = useMemo(() => components?.get(HVACViewer), [components]);

    useEffect(() => {
        if (!components) return;
        if (!hvacViewer.enabled) hvacViewer.enabled = true;
        hvacViewer.onFoundElementsChanged.add(handleHvacTreeUpdated)
        hvacViewer.onGroupTreeChanged.add(handleHvacTreeUpdated)

        console.log('hvac panel opened')
        if (hvacViewer.foundElements)
            handleHvacTreeUpdated()
        hvacViewer.showTags(true)


        return (() => {
            hvacViewer.onFoundElementsChanged.remove(handleHvacTreeUpdated)
            hvacViewer.onGroupTreeChanged.remove(handleHvacTreeUpdated)
            hvacViewer.showTags(false)

        })
    }, [components]);

    useEffect(() => {
        if (!SelectedNode) return;
        hvacViewer.highlightGroup(SelectedNode?.id);
    }, [SelectedNode])

    const handleHvacTreeUpdated = () => {
        if (hvacViewer.foundElements.length <= 0) return;
        console.log('hvac panel found elements')
        if (hvacViewer.prefabGroups) {
            // setNodes([...hvacViewer.prefabGroups?.root?.children?.values()])
            const prefabGroups = [...hvacViewer.prefabGroups?.root?.children?.values()];
            const mainNodes = prefabGroups.filter(group => group.children.size > 1 && group.name !== "Unspecified")
            const otherNodes = prefabGroups.filter(group => group.children.size === 1 || group.name === "Unspecified")

            setPrefabNodes(mainNodes)
            setOtherNodes(otherNodes)
            // split it out get nodes with multiple children or not specific
        }
    };



    function handleButtonClick(type: sustainerProperties): void {
        setSelected(type);
        hvacViewer.groupingType = type;
    }

    return (
        <PanelBase
            title="Installation view"
            icon="mdi:pipe-disconnected"
            body="Installation elements grouped by their prefab property value. 
                A prefab is a collection of elements is typically cables and hardware. 
                This is helpful to know how to prepare cables step-by-step."
            buttonBar={<ButtonGroup style={{ flexShrink: 0, }}>
                {hvacViewer.groupingOptions.map((type) => (
                    <Chip
                        key={type}
                        label={type}
                        clickable
                        onClick={() =>
                            handleButtonClick(type)
                        }
                        color={selected === type ? "primary" : "default"}
                        variant={selected === type ? "filled" : "outlined"}
                        sx={{
                            fontSize: "0.475rem", // Adjust font size to make it smaller
                            padding: "0 1px", // Add a bit of padding
                            height: "18px", // Reduce chip height
                            margin: '0 2px',
                        }}
                    />
                ))}
            </ButtonGroup>}
        >
            {prefabNodes &&
                Array.from(prefabNodes).map((data) => (
                    <TreeTableRow
                        onToggleVisibility={() => { console.log('vis toggle') }}
                        onDoubleClick={() => { console.log('double click') }}
                        onClick={(node) => {
                            console.log('click')
                            setSelectedNode(node)
                        }}
                        name={data.name}
                        treeID={treeID}
                        icon="ic:outline-power"
                        node={data}
                        key={data.id}
                        variant="Flat"
                        customRowContent={getRowContent(data)}
                    />
                ))}
            {otherNodes && <HeaderWithDropdown onSelected={setSelectedNode} otherNodes={otherNodes} treeID={treeID} />}
        </PanelBase>
    );
}


interface HeaderWithDropdownProps {
    otherNodes: TreeNode<IfcElement>[];
    treeID: string;
    onSelected: (node: TreeNode<IfcElement>) => void;
}

export const HeaderWithDropdown: React.FC<HeaderWithDropdownProps> = ({
    otherNodes,
    treeID,
    onSelected
}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const toggleDropdown = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <Box component="div">
            {/* Header */}
            <Box
                component="div"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Typography>Other Installations</Typography>
                <IconButton onClick={toggleDropdown} aria-expanded={isExpanded}>
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            {/* Dropdown Content */}
            {isExpanded && (
                <Box
                    component="div"
                    m="0px"
                >
                    {otherNodes.map((data) => (
                        <TreeTableRow
                            onToggleVisibility={() => console.log("vis toggle")}
                            onDoubleClick={() => console.log("double click")}
                            onClick={(node) => {
                                console.log("click");
                                onSelected(node)
                            }}
                            name={data.name}
                            treeID={treeID}
                            icon="mdi:pipe-disconnected"
                            node={data}
                            key={data.id}
                            variant="Flat"
                            customRowContent={getRowContent(data)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

function getRowContent(node: TreeNode<IfcElement>): React.ReactNode {

    const getChips = (): React.ReactNode[] => {
        const chips = [];
        if (node?.children?.size) {
            console.log('node', node)

            const elements = [...node.children.values()];//.filter(child => child.type === KnownGroupType.Assembly)
            if (elements.length > 0) {
                console.log('children', elements)
                chips.push(<Chip key="parts" label={`${elements.length} parts`} size="small" />);
            }
        }

        return chips;
    }

    return (
        <RowContent
            name={node.name}
            // icon={"ic:outline-power"}
            icon={"subway:power"}
            node={node}
            chips={getChips()}
        />
    )
}

export default InstallationHelperPanel;