import { useEffect, useState } from "react";
import * as BUI from "@thatopen/ui";
import { Icon } from "@iconify/react";
import { useComponentsContext } from "../context/ComponentsContext";
import ViewPresenter from "../bim-components/ViewPresenter";
import { ModelCache } from "../bim-components/modelCache";
import { Box, Button, InputBase, Slider, Typography, useTheme } from "@mui/material";
import { ViewRow } from "./ViewRow";
import { PanelBase } from "./PanelBase";
import AnimationSlider from "./AnimationSlider";
import { tokens } from "../theme";

interface RowData {
  id: string;
  name: string;
}

export const ViewPresenterPanel = () => {
  const components = useComponentsContext();
  const [isSetUp, setIsSetUp] = useState<boolean>(false);
  const [rows, setRows] = useState<RowData[]>([]);
  const viewPresenter = components.get(ViewPresenter);

  useEffect(() => {
    if (!components || isSetUp) return;
    BUI.Manager.init();
    viewPresenter.onPointsChanged.add(() => updateTable());
    if (components.get(ModelCache).world) {
      viewPresenter.world = components.get(ModelCache).world;
    } else {
      components.get(ModelCache).onWorldSet.add((data) => (viewPresenter.world = data));
    }
    updateTable();

    return () => {
      components.get(ModelCache).onWorldSet.remove((data) => (viewPresenter.world = data));
      viewPresenter.onPointsChanged.remove(() => updateTable());
      setIsSetUp(false);
    };
  }, [components]);

  const updateTable = () => {
    if (!viewPresenter) {
      // could fill with dumby data...
      return;
    }
    const updatedRows: RowData[] = [];
    [...viewPresenter.views.values()].forEach((sceneProps) => {
      updatedRows.push({ id: sceneProps.id, name: sceneProps.name });
    });

    console.log('view rows updated', updatedRows)

    setRows(updatedRows);
  };

  return (
    <PanelBase
      title={"View Presenter"}
      body={"You can save current camer views and animate them with the buttons bellow"}
      icon="ph:video-camera-bold"
      buttonBar={ButtonBar()}
    >
      {rows &&
        rows?.map((r, index) => {
          return <ViewRowComponent rowData={r} key={r.id} index={index} viewManager={viewPresenter} />;
        })}
    </PanelBase>
  );
};

const ButtonBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const showcaser = components.get(ViewPresenter);

  //   <Box component="div" padding='0.5rem 1rem'  flexDirection="row" display="flex">
  //   {/* <Slider color="secondary"
  //   step={100 / showcaser.views.length}
  //   marks>

  //   </Slider> */}
  //   {/* <AnimationSlider/> */}
  // </Box>

  return (
    <>
      <Box component="div" flexDirection="row" display="flex">
        <Button
          onClick={() => showcaser.addNewView()}
          variant="text"
          style={{ color: colors.grey[200], borderRight: "1px" }}
        >
          new View
          <Icon icon="material-symbols:photo-camera" />
        </Button>
        <Button onClick={() => showcaser.showPath()} variant="text" style={{ color: colors.grey[200] }}>
          Show Path
          <Icon icon="mdi:eye" />{" "}
        </Button>
        <Button onClick={() => showcaser.playPause()} variant="text" style={{ color: colors.grey[200] }}>
          Play / pause
          <Icon icon="mdi:play-pause" />
        </Button>
      </Box>
    </>
  );
};

interface ViewRowProps {
  rowData: RowData;
  index: number;
  viewManager: ViewPresenter;
}

const ViewRowComponent: React.FC<ViewRowProps> = ({ viewManager, rowData, index }) => {
  const [value, setValue] = useState(rowData.name);
  const [viewId, setViewId] = useState(viewManager.views[index]?.id);
  const [rowIndex, setIndex] = useState(index);
  const [selectionGroupId, setSelectionGroupId] = useState(viewManager.views[index]?.SelectionGroupId);
  console.log('viewRow id', viewId)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // console.log("User clicked away. Final value:", value);
    viewManager.changeViewName(viewId, value);
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
            {selectionGroupId && (
              <Typography>{selectionGroupId.slice(selectionGroupId.lastIndexOf("_") + 1)}</Typography>
            )}
            <Button
              onClick={() => viewManager.deleteView(viewId)}
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
              onClick={() => viewManager.setCamAtView(viewId, selectionGroupId)}
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
