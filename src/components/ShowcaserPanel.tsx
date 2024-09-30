import { useEffect, useRef, useState } from "react";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";

import { useComponentsContext } from "../context/ComponentsContext";
import Showcaser from "../bim-components/showcaser";
import { ModelCache } from "../bim-components/modelCache";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

// const columns: GridColDef[] = [
//     {

//     }
// ]

export const ShowcaserPanel = () => {
    const components = useComponentsContext();
    const panelSection = useRef<HTMLDivElement | null>(null);
    const [isSetUp, setIsSetUp] = useState<boolean>(false);
    const showcaser = components.get(Showcaser);



    useEffect(() => {
        if (!components || isSetUp) return;
        BUI.Manager.init();

        loadSettingsPanel(components);

        if (components.get(ModelCache).world) {
            showcaser.world = components.get(ModelCache).world;
        } else {
            components.get(ModelCache).onWorldSet.add((data) => showcaser.world = data)
        }

        return () => {
            if (panelSection.current) {
                panelSection.current.innerHTML = "";
            }
            components.get(ModelCache).onWorldSet.remove((data) => showcaser.world = data)

            setIsSetUp(false);
        };
    }, [components]);

    const loadSettingsPanel = async (components: OBC.Components) => {
        if (!components) return;

        const panel = BUI.Component.create(() => {
            return BUI.html`
      <bim-panel-section label='Showcaser' icon='mdi:video'>
        <div style='display: flex; gap: 0.375rem;'>
          <bim-button label='Add Point' icon='material-symbols:point-scan' @click=${() => showcaser.addPoint()} icon="mi:add"></bim-button>
          <bim-button label='Show Path' icon='tabler:eye-filled' @click=${() => showcaser.showPath()}></bim-button>
          <bim-button label='Play/Pause' icon='material-symbols:play-pause' @click=${() => showcaser.playPause()}></bim-button>
        </div>
      </bim-panel-section>
            `;
        });
        if (panelSection.current && panel) {
            panelSection.current.replaceChildren(panel);
        }

        setIsSetUp(true);
    };

    return (<>
        <>
            <div
                className="ShowCaserWebComponentContainer"
                style={{
                    overflow: "auto", // Add scroll if content exceeds dimensions
                }}
            >
                <Box component='div' flexDirection='row' display='flex'>
                    <Button
                        onClick={() => showcaser.addPoint()}
                        variant="contained" color="primary">
                        Add Point
                        {/* <Icon icon="mdi:color" /> */}
                    </Button><Button
                        onClick={() => showcaser.showPath()}
                        variant="contained"
                        color="primary">
                        Show Path
                        {/* <Icon icon="mdi:color" /> */}
                    </Button><Button
                        onClick={() => showcaser.playPause()}
                        variant="contained"
                        color="primary">
                        Play/pause
                        {/* <Icon icon="mdi:color" /> */}
                    </Button>
                </Box>
                <Box component='div' flexDirection='row' display='flex'>
                    {/* <DataGrid columns={}>

                    </DataGrid> */}
                </Box>

            </div>
        </>
    </>)
}

export const ShowcaserPanelWebC = () => {
    const components = useComponentsContext();
    const panelSection = useRef<HTMLDivElement | null>(null);
    const [isSetUp, setIsSetUp] = useState<boolean>(false);
    const showcaser = components.get(Showcaser);

    useEffect(() => {
        if (!components || isSetUp) return;
        BUI.Manager.init();

        loadSettingsPanel(components);

        if (components.get(ModelCache).world) {
            showcaser.world = components.get(ModelCache).world;
        } else {
            components.get(ModelCache).onWorldSet.add((data) => showcaser.world = data)
        }

        return () => {
            if (panelSection.current) {
                panelSection.current.innerHTML = "";
            }
            components.get(ModelCache).onWorldSet.remove((data) => showcaser.world = data)

            setIsSetUp(false);
        };
    }, [components]);

    const loadSettingsPanel = async (components: OBC.Components) => {
        if (!components) return;

        const panel = BUI.Component.create(() => {
            return BUI.html`
      <bim-panel-section label='Showcaser' icon='mdi:video'>
        <div style='display: flex; gap: 0.375rem;'>
          <bim-button label='Add Point' icon='material-symbols:point-scan' @click=${() => showcaser.addPoint()} icon="mi:add"></bim-button>
          <bim-button label='Show Path' icon='tabler:eye-filled' @click=${() => showcaser.showPath()}></bim-button>
          <bim-button label='Play/Pause' icon='material-symbols:play-pause' @click=${() => showcaser.playPause()}></bim-button>
        </div>
      </bim-panel-section>
            `;
        });
        if (panelSection.current && panel) {
            panelSection.current.replaceChildren(panel);
        }

        setIsSetUp(true);
    };

    return (<>
        <>
            <div
                className="ShowCaserWebComponentContainer"
                style={{
                    overflow: "auto", // Add scroll if content exceeds dimensions
                }}
                ref={panelSection}
            ></div>
        </>
    </>)
}
