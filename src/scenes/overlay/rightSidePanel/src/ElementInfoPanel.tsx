import {
  Grid,
  Box,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { BuildingElement, sustainerProperties } from "../../../../utilities/types";
import { Icon } from "@iconify/react";
import * as OBF from "@thatopen/components-front";
import { tokens } from "../../../../theme";
import { FragmentIdMap } from "@thatopen/fragments";
import { ModelCache } from "../../../../bim-components/modelCache";
import React from "react";

const ElementInfoPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [selected, setSelected] = useState<BuildingElement | null>();
  const [rows, setRows] = useState<any[]>([]); // rows of properties on a building element

  // listen to selected assembly and set its data when changed

  useEffect(() => {
    //listen to assembly selected change
    if (!components) return;

    const highlighter = components.get(OBF.Highlighter);
    console.log("InfoPanel Setting up");

    highlighter.events.select.onHighlight.add((data) => handleSelectionChanged(data));
    const currentSelection = highlighter.selection["select"];
    if (currentSelection) {
      handleSelectionChanged(currentSelection);
    }

    return () => {
      highlighter.events.select.onHighlight.remove((data) => handleSelectionChanged(data));
    };
  }, [components]);

  // get selected itemID and convert it to a BuildingElements
  function handleSelectionChanged(data: FragmentIdMap) {
    // console.log("highlighter updating", data);
    //search model/s for the fragments to get the expressIDS
    const cache = components.get(ModelCache);

    const elements = cache.getElementByFragmentIdMap(data);

    if (!elements) return;
    const selectedElement = [...elements].pop();

    if (selectedElement) {
      setSelected(selectedElement);
      setupTable(selectedElement);
    }
  }

  /**
   * Takes a building Element and returns all properties in rows
   * @param element
   */
  const setupTable = (element: BuildingElement) => {
    let newRows: any[] = [];

    element.properties.map((element, index) => {
      const row = {
        key: index,
        name: element.name,
        value: element.value,
        pSet: element.pSet,
      };
      newRows.push(row);
    });
    //console.log("table rows created", newRows);

    setRows(newRows);
  };

  const findProperty = (
    element: BuildingElement,
    propertyName: sustainerProperties
  ): { name: string; value: string; pSet: string } | undefined => {
    return element.properties.find((prop) => prop.name === propertyName);
  };

  const onSelectChanged = (selectedIds: readonly number[]) => {
    // if (!selected?.elements || !selectedIds) return;
    // const rowsSelected = selectedIds.map((id) => rows.find((row) => row.key === id));
    // // use the row ids to get the elements
    // // select elements with matching Code from the selection group
    // // use these building elements to select them
    // if (!selected) return;
    // const buildingElements = rowsSelected
    //   .flatMap((row) => selected.elements.find((sElement) => sElement.expressID === row.expressID))
    //   .filter((element): element is NonNullable<typeof element> => element !== undefined);
    // select(buildingElements, components);
    // // console.log("Selected codes", selectedCodes);
    // console.log("Selected elements", buildingElements);
  };

  return (
    <>
      <Box
        component="div"
        flexDirection="column"
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
        }}
      >
        <Box
          component="div"
          sx={{
            p: 2,
            display: "flex", // Flex container
            flexDirection: "row", // Horizontal layout within this box
            alignItems: "center", // Center align items vertically
            width: "100%",
          }}
        >
          <Box component="div" sx={{ mr: 2 }}>
            <Icon color={colors.grey[400]} icon="system-uicons:box" />
          </Box>
          <Grid container direction="column">
            <Typography variant="h6">
              {!selected ? "Selected element" : findProperty(selected, sustainerProperties.ProductCode)?.value}
            </Typography>
            <Typography variant="body2">{!selected ? "Selected element" : selected.name}</Typography>
          </Grid>
        </Box>

        <BasicDataTable
          sx={{
            flexGrow: 1,
            overflowX: "hidden",
            height: "100%",
            margin: "0px",
            width: "100%",
          }}
          onSelectChanged={onSelectChanged}
          columns={columns}
          data={rows}
        />
      </Box>
    </>
  );
};

interface dataTableProps {
  data: any[];
  columns: Column[];
  onSelectChanged: (selectedIds: readonly number[]) => void;
  sx?: React.CSSProperties;
}

const BasicDataTable: React.FC<dataTableProps> = ({ data, columns, onSelectChanged, sx }) => {
  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);
  const theme = useTheme();
  const [selected, setSelected] = useState<readonly number[]>([]);

  useEffect(() => {
    setSelected([]);
  }, [data]);

  const handleClick = useCallback(
    (event: React.MouseEvent<unknown>, key: number): void => {
      const selectedIndex = selected.indexOf(key);
      let newSelected: readonly number[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, key);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
      }
      setSelected(newSelected);
      onSelectChanged(newSelected);
    },
    [selected, onSelectChanged]
  );

  const isSelected = useCallback((key: number) => selected.indexOf(key) !== -1, [selected]);

  return (
    <TableContainer component={Paper} sx={{ ...sx }}>
      <Table stickyHeader sx={{ width: "100%" }} size={"small"} aria-label="simple table">
        <TableHead>
          <TableRow>
            {memoizedColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ top: 0, maxWidth: column.maxWidth, minWidth: column.minWidth, width: column.maxWidth }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {memoizedData.map((row) => {
            return (
              <MemoizedTableRow
                key={row.key} // Unique key for each row
                row={row}
                isItemSelected={isSelected(row.key)}
                handleClick={handleClick}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface Column {
  id: "name" | "value";
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: "name", label: "Name", minWidth: 100, maxWidth: 100 },
  { id: "value", label: "Value", minWidth: 100, maxWidth: 100 },
];

const MemoizedTableRow = React.memo(({ row, isItemSelected, handleClick }: any) => (
  <Tooltip key={row.key} title={row.value}>
    <TableRow
      hover
      onClick={(event) => handleClick(event, row.key)}
      key={row.key}
      selected={isItemSelected}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell sx={{ paddingLeft: "10px", paddingRight: "0px" }} align="left" component="th" scope="row">
        {row.name}
      </TableCell>
      <TableCell align="left" sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {row.value}
      </TableCell>
    </TableRow>
  </Tooltip>
));

export default ElementInfoPanel;
