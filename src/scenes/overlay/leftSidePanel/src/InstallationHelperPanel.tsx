import React, { useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Box, ButtonGroup, Chip, IconButton, Typography } from "@mui/material";
import { BuildingElement, IfcElement } from "../../../../utilities/types";
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
    const hvacViewer = useMemo(() => components?.get(HVACViewer), [components]);

    useEffect(() => {
        if (!components) return;
        if (!hvacViewer.enabled) hvacViewer.enabled = true;
        hvacViewer.onFoundElementsChanged.add(handleHvacFound)

        console.log('hvac panel opened')
        if (hvacViewer.foundElements)
            handleHvacFound(hvacViewer.foundElements)

        return (() => {
            hvacViewer.onFoundElementsChanged.remove(handleHvacFound)
        })
    }, [components]);

    useEffect(() => {
        if (!SelectedNode) return;
        hvacViewer.highlightGroup(SelectedNode?.id);
    }, [SelectedNode])

    const handleHvacFound = (data: BuildingElement[]) => {
        if (data.length <= 0) return;
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



    return (
        <PanelBase
            title="Installation view"
            icon="mdi:pipe-disconnected"
            body="Installation elements grouped by their prefab property value. 
                A prefab is a collection of elements is typically cables and hardware. 
                This is helpful to know how to prepare cables step-by-step."
        >
            <ButtonGroup style={{ flexShrink: 0, marginTop: "18px", marginBottom: "10px", justifyContent: "center" }}>

            </ButtonGroup>

            <Box component="div" m="0px"
                style={{
                    height: '100%',
                    overflowY: 'auto'
                }}
                width="100%">
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
                            icon="mdi:pipe-disconnected"
                            node={data}
                            key={data.id}
                            variant="Flat"
                            customRowContent={getRowContent(data)}
                        />
                    ))}
            </Box>
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
                    sx={{
                        height: "100%",
                        overflowY: "auto",
                        width: "100%",
                    }}
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
            icon={"mdi:pipe-disconnected"}
            node={node}
            chips={getChips()}
        />
    )
}

export default InstallationHelperPanel;