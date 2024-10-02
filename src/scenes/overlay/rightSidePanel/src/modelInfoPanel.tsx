import {
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
  Checkbox,
  useTheme,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { BuildingElement, knownProperties } from "../../../../utilities/types";
import { Icon } from "@iconify/react";
import { tokens } from "../../../../theme";
import { select } from "../../../../utilities/BuildingElementUtilities";
import { ModelCache } from "../../../../bim-components/modelCache";
import EnhancedTable, { TableData } from "./EnhancedTable";


const ModelInfoPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [rows, setRows] = useState<TableData[]>([]);
  const [elements, setElements] = useState<BuildingElement[]>([])

  // listen to selected assembly and set its data when changed

  useEffect(() => {
    //listen to assembly selected change
    if (!components) return;

    const cache = components.get(ModelCache);
    cache.onBuildingElementsChanged.add((data) => {
      handleBuildingElementsChange(data);
    });
    if (cache.buildingElements) handleBuildingElementsChange(cache.buildingElements);

    return () => {
      cache.onBuildingElementsChanged.remove((data) => {
        handleBuildingElementsChange(data);
      });
    };
  }, [components]);

  function handleBuildingElementsChange(data: BuildingElement[]) {
    setElements(data)
    setupTable(data);
  }



  const setupTable = (elements: BuildingElement[]) => {
    console.log("start setting up table", elements);
    let newRows: TableData[] = [];

    elements.map((element, index) => {
      const row = createSimpleTableDataElement(element, index);
      newRows.push(row);
    });

    // Group rows by their matching product code
    const groupedRows = newRows.reduce((acc, row) => {
      const productCode = row.productCode;
      if (!acc.has(productCode)) {
        acc.set(productCode, row);
      }
      const newRow = acc.get(productCode)
      if (newRow) {
        newRow.quantity += 1; // Increment the quantity
      }
      return acc;
    }, new Map<string, TableData>);

    // Convert the grouped object back to an array
    const finalRows = Object.values(groupedRows);

    console.log("rows", finalRows);
    setRows(finalRows);
  };

  const createSimpleTableDataElement = (element: BuildingElement, index: number): TableData => {
    return {
      id: index,
      name: element.name,
      material: findProperty(element, knownProperties.Material)?.value ?? "UNK",
      productCode: findProperty(element, knownProperties.ProductCode)?.value ?? "UNK",
      expressID: element.expressID,
      type: element.type,
      quantity: 0
    };
  };

  const findProperty = (
    element: BuildingElement,
    propertyName: knownProperties
  ): { name: string; value: string; pSet: string } | undefined => {
    return element.properties.find((prop) => prop.name === propertyName);
  };

  const onSelectChanged = (selectedIds: readonly number[]) => {
    if (!elements || !selectedIds) return;
    const rowsSelected = selectedIds.map((id) => rows.find((row) => row.id === id));

    // use the row ids to get the elements
    // select elements with matching Code from the selection group
    // use these building elements to select them
    // if (!selected) return;

    const buildingElements = rowsSelected
      .flatMap((row) => elements.find((selected) => selected.expressID === row?.expressID))
      .filter((element): element is NonNullable<typeof element> => element !== undefined);
    select(buildingElements, components);
    console.log("Selected elements", buildingElements);
  };

  return (
    <>
      <Box
        component="div"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="stretch"
        sx={{ height: "100%", width: "100%" }}
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
            <Icon
              color={colors.grey[400]}
              icon={"system-uicons:box"}
            />
          </Box>
          <Typography variant="h6">Model Elements</Typography>
        </Box>

        <Box component="div" sx={{ height: "auto", p: 2 }}>
          <Typography variant="body2">Summary data and status of model elements</Typography>
        </Box>

        <Box
          component="div"
          sx={{
            flexGrow: 1,
            width: "100%",
            height: "20%",
            overflowX: "hidden",
            overflowY: "auto", // Enable scrolling when content exceeds height
          }}
        >
          {/* <BasicDataTable onSelectChanged={onSelectChanged} columns={columns} data={rows} /> */}
          <EnhancedTable rows={rows} />
        </Box>
        <Divider />
      </Box>
    </>
  );
};

interface dataTableProps {
  data: any[];
  columns: Column[];
  onSelectChanged: (selectedIds: readonly number[]) => void;
}

const BasicDataTable: React.FC<dataTableProps> = ({ data, columns, onSelectChanged }) => {
  const [selected, setSelected] = useState<readonly number[]>([]);

  useEffect(() => {
    setSelected([]);
  }, [data]);

  //   console.log("table new data", data);
  function handleClick(event: any, id: any): void {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
    onSelectChanged(newSelected);
  }

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  return (
    <TableContainer component={Paper}>
      <Table
        stickyHeader
        sx={{ height: "100%", width: "100%", overflowX: "hidden" }}
        size={"small"}
        aria-label="simple table"
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ top: 0, maxWidth: column.maxWidth, minWidth: column.minWidth }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data &&
            data.map((row, index) => {
              const isItemSelected = isSelected(row.key);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  onClick={(event) => handleClick(event, row.key)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  key={row.id}
                  selected={isItemSelected}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell onDragOver={(event) => handleClick(event, row.key)} padding="checkbox">
                    <Checkbox
                      color="secondary"
                      checked={isItemSelected}
                      inputProps={{
                        "aria-labelledby": labelId,
                      }}
                    />
                  </TableCell>
                  <TableCell component="th" align="center" scope="row">
                    {row.Quantity}
                  </TableCell>
                  <Tooltip title={row.name}>
                    <TableCell
                      sx={{ paddingLeft: "15px", paddingRight: "8px" }}
                      align="center"
                      component="th"
                      scope="row"
                    >
                      {row.material}
                    </TableCell>
                  </Tooltip>
                  <TableCell align="right" sx={{ paddingLeft: "0px" }}>
                    {row.productCode}
                  </TableCell>
                  <TableCell align="right" sx={{ paddingLeft: "0px" }}>
                    {row.type}
                  </TableCell>
                  <TableCell align="left" sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {row.name}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};


interface Column {
  id: "select" | "Quantity" | "name" | "code" | "Material" | "type";
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: "select", label: "Select", minWidth: 20, maxWidth: 20 },
  { id: "Quantity", label: "Qty", minWidth: 10, maxWidth: 20 },
  {
    id: "Material",
    label: "Material",
    minWidth: 20,
    align: "right",
    maxWidth: 20,
  },
  { id: "code", label: "Product\u00a0Code", minWidth: 125, maxWidth: 100 },
  { id: "type", label: "Type", minWidth: 125, maxWidth: 100 },
  { id: "name", label: "Name", minWidth: 70, maxWidth: 100 },
];

export default ModelInfoPanel;
