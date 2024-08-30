import { Box, useTheme, Typography, IconButton } from "@mui/material";
import { tokens } from "../../../../theme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useContext, useEffect, useState } from "react";
import StationBox from "./StationBox";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { Tree, TreeNode } from "../../../../utilities/Tree";
import { BuildingElement } from "../../../../utilities/types";
import { nonSelectableTextStyle } from "../../../../styles";

const AssemblyBrowser = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [groups, setGroups] = useState<TreeNode<BuildingElement>[]>();
  const [stationsVisible, setStationsVisible] = useState<boolean>(true);

  useEffect(() => {
    if (!components) return;

    let viewManager = components.get(ModelViewManager);
    viewManager.onTreeChanged.add((data) => handleTreeChange(data));
    if (viewManager.Tree) {
      handleTreeChange(viewManager.Tree);
    }

    return () => {
      viewManager.onTreeChanged.remove((data) => handleTreeChange(data));
    };
  }, [components]);

  const handleTreeChange = (data: Tree<BuildingElement>) => {
    console.log("task over view panel handeling new groups:", data);
    if (!data) return;

    const groups = data.root.children; // these are top level displays
    console.log("taskOver setting groups:", groups);
    if (groups) {
      // make sure groups are of same type
      console.log("task over view: groups:", groups)
      setGroups(Array.from(groups.values()));
    }
  };


  const HeaderBoxStyle = {
    // backgroundColor: colors.primary[400],
    // boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    // border: '1px solid #ccc',
    padding: "5px",
    // width: "240px",
    margin: "10px",
    borderRadius: "8px",
    cursor: "grab",
  };

  return (
    <>
        <div
          style={{
            top: "0%",
            left: 0,
            zIndex: 50,
            padding: "0px",
            width: "100%",
          }}
        >
          <div>
            <Box
              component="div"
              m="10px"
              maxHeight="100%"
              overflow="auto"
              width="90%"
            >
              {stationsVisible &&
                groups &&
                Array.from(groups).map((data, index) => (
                  <StationBox key={`${data}-${index}`} node={data} />
                  ))}
            </Box>
          </div>
        </div>
    </>
  );
};

export default AssemblyBrowser;
