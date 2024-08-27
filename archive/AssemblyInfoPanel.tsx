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
  Checkbox,
  useTheme,
} from "@mui/material";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { ModelViewManager } from "../src/bim-components/modelViewer";
import { useComponentsContext } from "../src/context/ComponentsContext";
import { SelectionGroup, KnowGroupType, BuildingElement, knownProperties } from "../src/utilities/types";
import { Icon } from "@iconify/react";
import { tokens } from "../src/theme";

const AssemblyInfoPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const viewManager = useRef<ModelViewManager>();
  const [selected, setSelected] = useState<SelectionGroup | null>();
  const [rows, setRows] = useState<any[]>([]);

  // listen to selected assembly and set its data when changed

  useEffect(() => {
    //listen to assembly selected change
    if (!components) return;

    const viewManager = components.get(ModelViewManager);
    viewManager.onSelectedGroupChanged.add((data) => {
      handleSelectedGroupChange(data);
    });
    if (viewManager.SelectedGroup) handleSelectedGroupChange(viewManager.SelectedGroup);

    return () => {
      viewManager.onSelectedGroupChanged.remove((data) => {
        handleSelectedGroupChange(data);
      });
    };
  }, [components]);

  function handleSelectedGroupChange(data: SelectionGroup) {
    setSelected(data);
    setupTable(data.elements);
  }

  const setupTable = (elements: BuildingElement[]) => {
    console.log("start setting up table", elements);
    let newRows: any[] = [];

    elements.map((element, index) => {
      const row = createSimpleTableDataElement(element, index);
      newRows.push(row);
    });

    // Group rows by their matching product code
    const groupedRows = newRows.reduce((acc, row) => {
      const productCode = row.productCode;
      if (!acc[productCode]) {
        acc[productCode] = { ...row, Quantity: 1 }; // Create a new entry with Quantity 1
      } else {
        acc[productCode].Quantity += 1; // Increment the quantity
      }
      return acc;
    }, {} as { [key: string]: any });

    // Convert the grouped object back to an array
    const finalRows = Object.values(groupedRows);

    console.log("rows", finalRows);
    setRows(finalRows);
  };

  const createSimpleTableDataElement = (element: BuildingElement, index: number) => {
    return {
      key: index,
      name: element.name,
      material: findProperty(element, "Materiaal")?.value,
      productCode: findProperty(element, "Productcode")?.value,
      expressID: element.expressID,
    };
  };

  const findProperty = (
    element: BuildingElement,
    propertyName: knownProperties
  ): { name: string; value: string; pSet: string } | undefined => {
    return element.properties.find((prop) => prop.name === propertyName);
  };

  const onSelectChanged = (selectedIds: readonly number[]) => {
    if (!selected?.elements || !selectedIds) return;
    const rowsSelected = selectedIds.map((id) => rows.find((row) => row.key === id));
    console.log("Selected Changed", rowsSelected);
  };

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="stretch"
        spacing={1}
        sx={{ height: "100%", width: "100%" }}
      >
        <Grid item xs={1} sx={{ height: "100%", width: "100%", p: 0 }}>
          <Box
            component={"div"}
            sx={{
              p: 2,
              display: "flex", // Flex container
              flexDirection: "row", // Horizontal layout within this box
              alignItems: "center", // Center align items vertically
              width: "100%",
            }}
          >
            {" "}
            <Box component={"div"} sx={{ mr: 2 }}>
              <Icon
                color={colors.grey[400]}
                icon={selected?.groupType === KnowGroupType.Assembly ? "system-uicons:box" : "system-uicons:boxes"}
              />
            </Box>
            <Typography variant="h6">{!selected ? "Assembly Name" : selected.groupName}</Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box component={"div"} sx={{ height: "100%", p: 2 }}>
          <Typography variant="body2">Summary data and status of assembly</Typography>

            
          </Box>
        </Grid>
        <Grid item xs={5}>
          <Box component={"div"} sx={{  width: "100%", height: "100%", p: 0 }}>
            <BasicDataTable onSelectChanged={onSelectChanged} columns={columns} data={rows} />
          </Box>
        </Grid>
      </Grid>
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

  //   console.log("table new data", data);
  function handleClick(event: MouseEvent<unknown>, id: any): void {
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
      <Table stickyHeader sx={{ width: "100%" }} size={"small"} aria-label="simple table">
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
                <Tooltip title={row.name}>
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.key)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="secondary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.Quantity}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.material}
                    </TableCell>
                    <TableCell align="right">{row.productCode}</TableCell>
                    <TableCell align="left" sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                      {row.name}
                    </TableCell>
                  </TableRow>
                </Tooltip>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface Column {
  id: "select" | "Quantity" | "name" | "code" | "Material";
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: "select", label: "Select", minWidth: 20, maxWidth: 20 },
  { id: "Quantity", label: "Qty", minWidth: 10,maxWidth: 20 },
  {
    id: "Material",
    label: "Material",
    minWidth: 20,
    align: "right",
    maxWidth: 20
  },
  { id: "code", label: "Product\u00a0Code", minWidth: 125, maxWidth: 100 },
  { id: "name", label: "Name", minWidth: 100, maxWidth: 120 },
];

export default AssemblyInfoPanel;
