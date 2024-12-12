import { useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Box, ButtonGroup } from "@mui/material";
import { BuildingElement, IfcElement } from "../../../../utilities/types";
import { TreeNode } from "../../../../utilities/Tree";
import { HVACViewer } from "../../../../bim-components/hvacViewer";
import TreeTableRow from "../../../../components/TreeTableRow";

const treeID = 'installationTree'

export const InstallationHelperPanel = () => {
    const components = useComponentsContext();
    const [nodes, setNodes] = useState<TreeNode<IfcElement>[]>();
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
            setNodes([...hvacViewer.prefabGroups?.root?.children?.values()])
        }
    };

    return (
        <>
            <div
                style={{
                    alignContent: "center",
                    top: "0%",
                    left: 0,
                    zIndex: 50,
                    height: "100%",
                    width: "100%",
                }}
            >
                {/* fixed panel section */}

                hello

                <ButtonGroup style={{ flexShrink: 0, marginTop: "18px", marginBottom: "10px", justifyContent: "center" }}>

                </ButtonGroup>

                <Box component="div" m="0px"
                    style={{
                        height: '100%',
                        overflowY: 'auto'
                    }}
                    width="100%">
                    {nodes &&
                        Array.from(nodes).map((data) => (
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
                            />
                        ))}
                </Box>
            </div>
        </>
    );
}


export default InstallationHelperPanel;