import { useState } from "react";
// import '.;
import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme.js";
import { DataGrid, GridToolbar, useGridApiRef } from "@mui/x-data-grid";
import { useEffect } from "react";
import { buildingElement } from "../utilities/BuildingElementUtilities.js";

interface ElementTableProps{
  buildingElements : buildingElement[];
  isDashboard: boolean;
}

type ColumnProps ={
  field: string,
  headerName: string;
  flex: number;
  minWidth: number;
}

type GroupedElement = {
  instances: number;
  id: number;
} & buildingElement;

// it is assumed that the data is an object representing an aray of building elements
export const ElementTable = ({ isDashboard = false, buildingElements } : ElementTableProps) => {
  const [columns, setColumns] = useState<ColumnProps[]>([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  //const [elements,setElements] = useState([])
  const [groupedElements, setGroupedElements] = useState<buildingElement[]>([])
  const apiRef = useGridApiRef();

//   create array of elements with instance count for reduced list

  useEffect(() => {
    console.log("elements changed, grouping starting",buildingElements)
    if(buildingElements === undefined)
      return;
    if(buildingElements.length > 0) {

        var id = 0;  // Initialize a unique ID counter outside the reducer for datagrid requirements
        console.log("grouping begins", buildingElements)
        const grouped = buildingElements.reduce<Record<string, GroupedElement>>((acc, item) => {
          const key = item.name;
          if (!acc[key]) {
            acc[key] = { instances: 0, ...item, id: ++id };
          }
          acc[key].instances += 1;
          return acc;
        }, {});
            
        console.log("grouped elememnts length", Object.values(grouped).length)

        if(Object.values(grouped).length > 0)
        {
            var newColumns= Object.keys(Object.values(grouped)[0]).map(key => ({
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1),
                flex: 1,
                minWidth: key === "instances" ? 40 : 120
            }));

            console.log("new columns", newColumns)
            setColumns(newColumns);
        }


        setGroupedElements(Object.values(grouped));
    }
  },[buildingElements] )

  return (
      <Box component={'div'} 
      // m='20px'
      // width='100%' 
      // maxWidth="80vw" 
      overflow="hidden">
          <Box component={'div'}
        // m="40px 0 0 0"
        // width="100%"
        // height="100%"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
              {/* <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv"
              /> */}
              <DataGrid 
              rows={groupedElements} 
              columns={columns} 
              // sx={{ height: '75%' }}
              initialState={{
                density :"compact"             
              }}

              // slots={{
              //   toolbar: GridToolbar,
              // }}

              // checkboxSelection
              autosizeOptions={{
                includeOutliers: false,
                includeHeaders: false,
              }}
              />
          </Box>
      </Box>
  );
}

export default ElementTable;

