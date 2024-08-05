import { useContext, useMemo, useRef, useState } from "react";
// import "../??styles.css";
import { Box, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridValueGetter } from "@mui/x-data-grid";
import { useEffect } from "react";
import React from "react";
import { tokens } from "../../../theme";
import { buildingElement, SelectionGroup } from "../../../utilities/types";
import { ComponentsContext } from "../../../context/ComponentsContext";
import { ModelViewManager } from "../../../bim-components/modelViewer";

interface GroupedElement extends buildingElement {
  instances: number;
  id: number;
}

// it is assumed that the data is an object representing an aray of building elements
export const FloatingDataGrid: React.FC = (): JSX.Element => {
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const components = useContext(ComponentsContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [groupedElements, setGroupedElements] = useState<FlattenedGroupedElement[]>([]);
  const [elements, setElements] = useState<buildingElement[]>([]);
  const [rows, setRows] = useState<{ [key: string]: string }[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>();
  const viewManager = useRef<ModelViewManager>();

  //   create array of elements with instance count for reduced list
  useEffect(() => {
    if (!components) return;
    viewManager.current = components.get(ModelViewManager);
    if (!viewManager.current) return;

    viewManager.current.onSelectedGroupChanged.add((data) => handleDataChange(data));

    return () => {
      viewManager.current?.onSelectedGroupChanged.remove((data) => handleDataChange(data));
    };
  }, [components]);

  const handleDataChange = (data: SelectionGroup) => {
    // convert this data into a collection of building elements
    if (!data.elements) return;

    const r = createRows(data.elements);
    setRows(r);
    const ro = r.at(0);
    if (!ro) return;
    const columns = getColumns(ro);
    console.log("columns", columns);
    if (columns) setColumns(columns);
  };

  const getColumns = (row: { [key: string]: string }) => {
    console.log("row keys", row);

    if (!row) return [];

    return Object.entries(row).map((key) => ({
      field: key[0],
      width: key.length * 10,
      // valueGetter: (params: any) => {
      //   // if(!value) return value;
      //   // const prop = row[id];
      //   console.log("value getting:",params)
      //   // return undefined;
      //   // return prop;
      // }
    }));
  };

  interface FlattenedGroupedElement {
    id: number;
    name: string;
    instances: number;
    [key: string]: any; // This allows for dynamic property fields
  }


  function createRows(data: buildingElement[]): { [key: string]: string }[] {
    return data.map((element, index) => {
      const row: { [key: string]: string } = {
        id: (index + 1).toString(),
        name: element.name,
      };

      element.properties.forEach((prop) => {
        row[prop.name] = prop.value;
      });

      return row;
    });

  }

  const createColumns = (buildingElements: buildingElement[]) => {
    if (Object.values(buildingElements).length > 0) {
      var newColumns = Object.keys(Object.values(buildingElements)[0]).map((key) => ({
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        flex: 1,
        minWidth: key === "instances" ? 40 : 120,
      }));
      console.log("Columns", newColumns);

      const visModel: GridColumnVisibilityModel = newColumns.reduce((acc, column) => {
        if (column.field.toLowerCase() === "name" || column.field.toLowerCase() === "productcode")
          acc[column.field] = true;
        else acc[column.field] = false;

        return acc;
      }, {} as GridColumnVisibilityModel);

      console.log("vis model", visModel);

      return newColumns;
    }
  };

  return (
    <Box
    
      component={"div"}
      m="20px"
      minWidth={"20vw"}
      // width="30vw"
      maxWidth="80vw"
      overflow="hidden"
      style={{
        position: "fixed",
        background: colors.grey[900],
        top: "10%",
        right: 0,
        zIndex: 500,
        padding: "15px",
        bottom: "20%",
        width: 350,
        height: "70%",
        maxHeight: "80%",
        overflowY: "auto",
      }}
    >
      <Box component={"div"}>
        <DataGrid
          rowHeight={40}
          autosizeOnMount
          // autoPageSize 
          //m="40px 0 0 0"
          //width="100%"
          // height="100%"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.blueAccent[700],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              border: "none",
              // backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              border: "none",

              backgroundColor: colors.blueAccent[700],
            },
          }}
          rows={rows}
          columns={columns}
          // columnVisibilityModel={columnVisibilityModel}
          initialState={{
            columns: {
              columnVisibilityModel: columnVisibilityModel,
            },
            density: "compact",
          }}
          autosizeOptions={{
            includeOutliers: false,
            includeHeaders: false,
          }}
        />
      </Box>
    </Box>
  );
};

export default FloatingDataGrid;
