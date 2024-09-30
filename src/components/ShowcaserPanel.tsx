import { useEffect, useRef, useState } from "react";
import * as BUI from "@thatopen/ui";
import { Icon } from "@iconify/react";
import { useComponentsContext } from "../context/ComponentsContext";
import Showcaser from "../bim-components/showcaser";
import { ModelCache } from "../bim-components/modelCache";
import { Box, Button, InputBase } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ViewRow } from "./ViewRow";

interface RowData {
  id: number;
  name: string;
}

export const ShowcaserPanel = () => {
  const components = useComponentsContext();
  const panelSection = useRef<HTMLDivElement | null>(null);
  const [isSetUp, setIsSetUp] = useState<boolean>(false);
  const [rows, setRows] = useState<RowData[]>([]);
  const showcaser = components.get(Showcaser);

  useEffect(() => {
    if (!components || isSetUp) return;
    BUI.Manager.init();

    showcaser.onPointsChanged.add(() => updateTable());

    if (components.get(ModelCache).world) {
      showcaser.world = components.get(ModelCache).world;
    } else {
      components.get(ModelCache).onWorldSet.add((data) => (showcaser.world = data));
    }
    updateTable();

    return () => {
      if (panelSection.current) {
        panelSection.current.innerHTML = "";
      }
      components.get(ModelCache).onWorldSet.remove((data) => (showcaser.world = data));
      showcaser.onPointsChanged.remove(() => updateTable());

      setIsSetUp(false);
    };
  }, [components]);

  const updateTable = () => {
    if (!showcaser) {
      // could fill with dumby data...
      return;
    }
    const updatedRows: RowData[] = [];
    [...showcaser.views.values()].forEach((sceneProps, index) => {
      updatedRows.push({ id: index, name: sceneProps.name });
    });

    setRows(updatedRows);
  };

  return (
    <>
      <>
        <div
          className="ShowCaserWebComponentContainer"
          style={{
            overflow: "auto", // Add scroll if content exceeds dimensions
          }}
        >
          <Box component="div" flexDirection="row" display="flex">
            <Button onClick={() => showcaser.addPoint()} variant="contained" color="primary">
              Add Point
              {/* <Icon icon="mdi:color" /> */}
            </Button>
            <Button onClick={() => showcaser.showPath()} variant="contained" color="primary">
              Show Path
              {/* <Icon icon="mdi:color" /> */}
            </Button>
            <Button onClick={() => showcaser.playPause()} variant="contained" color="primary">
              Play/pause
              {/* <Icon icon="mdi:color" /> */}
            </Button>
          </Box>
          <Box component="div" overflow="hidden" flexDirection="column" width="100%" padding="4px" display="flex">
            {rows &&
              rows?.map((r, index) => {
                return <ViewRowComponent rowData={r} index={index} viewManager={showcaser} />;
              })}
          </Box>
        </div>
      </>
    </>
  );
};

interface ViewRowProps {
  rowData: RowData;
  index: number;
  viewManager: Showcaser;
}

const ViewRowComponent: React.FC<ViewRowProps> = ({ viewManager, rowData, index }) => {
  const [value, setValue] = useState(rowData.name);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // console.log("User clicked away. Final value:", value);
    viewManager.changeViewProperties(index, { name: value });
  };
  return (
    <ViewRow
      name={rowData.name}
      rowContent={
        <Box
          component="div"
          display="flex"
          padding="0px"
          width={"100%"}
          justifyContent="flex-start"
          flexDirection="row"
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="set view name"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            inputProps={{ "aria-label": "view name input" }}
          />
          <Box component="div" display="flex" flexDirection="row">
            <Button
              onClick={() => viewManager.deletePoint(index)}
              sx={{
                minWidth: 0,
                padding: "8px",
              }}
              color="error"
              size="small"
            >
              <Icon style={{ fontSize: "12px" }} icon="mdi:bin-outline" />
            </Button>
            <Button
              onClick={() => viewManager.setCamAtIndex(index)}
              sx={{
                minWidth: 0,
                padding: "8px",
              }}
              color="secondary"
              size="small"
            >
              <Icon style={{ fontSize: "12px" }} icon="material-symbols:camera" />
            </Button>
          </Box>
        </Box>
      }
      variant="Floating"
      handleClick={() => console.log("click")}
      handleDoubleClick={() => console.log("double click")}
    />
  );
};

//
