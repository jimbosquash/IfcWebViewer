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
  Button,
  TableSortLabel,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { SelectionGroup, KnownGroupType, BuildingElement, sustainerProperties } from "../../../../utilities/types";
import { Icon } from "@iconify/react";
import { tokens } from "../../../../theme";
import { select } from "../../../../utilities/BuildingElementUtilities";
// import { saveAs } from "file-saver";
import Papa from "papaparse";
import saveAs from "file-saver";
import { ModelCache } from "../../../../bim-components/modelCache";
import { getValueByKey } from "../../../../utilities/indexedDBUtils";

// listen to selected assembly and set its data when changed
const AssemblyInfoPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [selected, setSelected] = useState<SelectionGroup | null>();
  const [rows, setRows] = useState<any[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof RowData>("material"); // Default sorting by 'name'

  useEffect(() => {
    if (!components) return;
    const viewManager = components.get(ModelViewManager);

    function handleSelectedGroupChange(data: SelectionGroup) {
      setSelected(data);
      setupTable(data.elements);
    }

    viewManager.onSelectedGroupChanged.add(handleSelectedGroupChange);
    if (viewManager.SelectedGroup) handleSelectedGroupChange(viewManager.SelectedGroup);

    return () => {
      viewManager.onSelectedGroupChanged.remove(handleSelectedGroupChange);
    };
  }, [components]);

  const setupTable = useCallback(async (elements: BuildingElement[]) => {
    console.log("start setting up table", elements);

    // Use Promise.all to wait for all createRow calls to resolve
    const newRows = await Promise.all(
      elements.map((element, index) => createRow(element, index))
    );

    // Group the rows by product code after all rows are created
    const groupedRows = groupByProductCode(newRows);

    // Set the rows state
    setRows(groupedRows);
  }, []);


  const groupByProductCode = (rows: RowData[]) => {
    const grouped = rows.reduce((acc, row) => {
      const { productCode } = row;
      if (!acc[productCode]) {
        acc[productCode] = { ...row };
      } else {
        acc[productCode].quantity += 1;
      }
      return acc;
    }, {} as Record<string, RowData>);
    return Object.values(grouped);
  };

  // const createRow = (element: BuildingElement, index: number): RowData => {
  //   return {
  //     key: index,
  //     name: element.name,
  //     alias: element.alias ?? "",
  //     material: findProperty(element, knownProperties.Material)?.value || "",
  //     productCode: findProperty(element, knownProperties.ProductCode)?.value || "",
  //     expressID: element.expressID,
  //     quantity: 1, // default quantity 1
  //     color: await getValueByKey(findProperty(element, knownProperties.ProductCode)?.value || "")
  //   };
  // };

  // Create an asynchronous version of createRow
  async function createRow(
    element: BuildingElement,
    index: number
  ): Promise<RowData> {
    const productCode = findProperty(element, sustainerProperties.ProductCode)?.value || "";
    const color = await getValueByKey(productCode);

    return {
      key: index,
      name: element.name,
      alias: element.alias ?? "",
      material: findProperty(element, sustainerProperties.Material)?.value || "",
      productCode,
      expressID: element.expressID,
      quantity: 1, // default quantity 1
      color: color?.color, // color object fetched from IndexedDB
    };
  }

  const findProperty = (element: BuildingElement, propertyName: sustainerProperties) => {
    return element.properties.find((prop) => prop.name === propertyName);
  };

  const onSelectChanged = (selectedIds: readonly number[]) => {
    if (!selected?.elements || !selectedIds) return;
    // Filter out null or undefined elements
    const selectedElements = selectedIds
      .map((id) => selected.elements.find((e) => e.expressID === id))
      .filter((element): element is BuildingElement => element !== undefined);

    // Call select only if there are valid elements
    if (selectedElements.length > 0) {
      select(selectedElements, components);
    }

    console.log("Selected elements", selectedElements);
  };

  const handleRequestSort = (property: keyof RowData) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRows = useCallback(() => {
    return rows.slice().sort((a, b) => {
      if (order === "asc") {
        return a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0;
      } else {
        return a[orderBy] > b[orderBy] ? -1 : a[orderBy] < b[orderBy] ? 1 : 0;
      }
    });
  }, [order, orderBy, rows]);

  const exportToCsv = () => {
    // Select specific properties for export (e.g., name, material, productCode)
    const exportData = sortedRows().map((row) => ({
      alias: row.alias,
      quantity: row.quantity,
      productCode: row.productCode,
      material: row.material,
      name: row.name,
    }));

    // Convert the data to CSV format using PapaParse
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `${components.get(ModelCache).models()[0].name}_${selected?.groupType}_${selected?.groupName}_BOM.csv`
    );
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
              icon={selected?.groupType === KnownGroupType.Assembly ? "system-uicons:box" : "system-uicons:boxes"}
            />
          </Box>
          <Typography variant="h6">{!selected ? "Assembly Name" : selected.groupName}</Typography>
        </Box>

        <Box component="div" sx={{ height: "auto", p: 2 }}>
          <Typography variant="body2">Summary data and status of assembly</Typography>
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
          <BasicDataTable
            onSelectChanged={onSelectChanged}
            columns={columns}
            data={sortedRows()}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
        </Box>
        <Divider />

        <Button onClick={exportToCsv} variant="contained" sx={{ m: 2, marginBottom: "2rem" }}>
          Export to CSV
        </Button>
      </Box>
    </>
  );
};

interface RowData {
  key: number;
  name: string;
  alias: string;
  material: string;
  productCode: string;
  expressID: number;
  quantity: number;
  color?: string;
}

interface dataTableProps {
  data: RowData[];
  columns: Column[];
  onSelectChanged: (selectedIds: readonly number[]) => void;
  order: "asc" | "desc";
  orderBy: keyof RowData;
  onRequestSort: (property: keyof RowData) => void;
}

const BasicDataTable: React.FC<dataTableProps> = ({
  data,
  columns,
  order,
  orderBy,
  onRequestSort,
  onSelectChanged,
}) => {
  const [selected, setSelected] = useState<readonly number[]>([]);

  const handleClick = (event: React.MouseEvent, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [...selected.slice(0, selectedIndex), ...selected.slice(selectedIndex + 1)];
    }
    setSelected(newSelected);
    onSelectChanged(newSelected);
  };

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
              <Tooltip title={column.id}>
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ maxWidth: column.maxWidth, minWidth: column.minWidth }}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : "asc"}
                    onClick={() => onRequestSort(column.id as keyof RowData)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              </Tooltip>
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
                  key={row.key}
                  selected={isItemSelected}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  {/* <TableCell onDragOver={(event) => handleClick(event, row.key)} padding="checkbox">
                    <Checkbox
                      color="secondary"
                      checked={isItemSelected}
                      inputProps={{
                        "aria-labelledby": labelId,
                      }}
                    />
                  </TableCell> */}
                  {/* <TableCell component="th" align="center" scope="row">
                    <div
                      style={{
                        backgroundColor: row.color, // Use the color from the row
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff", // White text inside the circle
                        fontWeight: "bold",
                      }}
                    >
                      {row.alias}
                    </div>
                  </TableCell> */}
                  <TableCell align="left" sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    <div
                      style={{
                        backgroundColor: row.color, // Use the color from the row
                        // borderRadius: "20%",
                        width: "100px",
                        height: "25px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff", // White text inside the circle
                        fontWeight: "bold",
                      }}
                    >
                      {row.productCode}
                    </div>
                  </TableCell>
                  <TableCell component="th" align="center" scope="row">
                    {row.quantity}
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

                  <TableCell
                    align="left"
                    sx={{ paddingLeft: "0px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
                  >
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
  id: "select" | "quantity" | "name" | "productCode" | "material" | "alias";
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: Column[] = [
  // { id: "select", label: "Select", minWidth: 20, maxWidth: 20 },
  // { id: "alias", label: "Alias", minWidth: 10, maxWidth: 20 },
  { id: "productCode", label: "Product\u00a0Code", minWidth: 105, maxWidth: 100 },
  { id: "quantity", label: "Qty", minWidth: 10, maxWidth: 20 },
  {
    id: "material",
    label: "Material",
    minWidth: 30,
    align: "right",
    maxWidth: 50,
  },
  { id: "name", label: "Name", minWidth: 70, maxWidth: 100 },
];

export default AssemblyInfoPanel;
