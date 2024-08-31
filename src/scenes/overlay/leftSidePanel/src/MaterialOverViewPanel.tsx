import { Icon } from "@iconify/react";
import { Box, Button, ButtonGroup, colors, Tooltip, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { nonSelectableTextStyle } from "../../../../styles";
import { tokens } from "../../../../theme";
import { Tree, TreeNode, TreeUtils } from "../../../../utilities/Tree";
import { BuildingElement } from "../../../../utilities/types";
import * as OBF from "@thatopen/components-front";
import { GetFragmentIdMaps } from "../../../../utilities/IfcUtilities";
import { ModelCache } from "../../../../bim-components/modelCache";

interface TreeOverviewProps {
  name: string;
  tree: Tree<BuildingElement> | undefined;
}

export const MaterialOverviewPanel: React.FC<TreeOverviewProps> = ({ tree, name }) => {
  const [nodes, setNodes] = useState<TreeNode<BuildingElement>[]>();
  const [visibleOnDoubleClick, setVisibleOnDoubleClick] = useState<boolean>(true);

  useEffect(() => {
    if (!tree) return;
    // console.log('children', tree)

    // now remove top tree as its project
    const children = tree.root.children.values();
    console.log("children", children);
    setNodes([...children]);
  }, [tree]);

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
        <ButtonGroup style={{ marginTop: "18px", marginBottom: "10px", alignSelf: "center" }}>
          <Tooltip title="clear visibility">
            <Button variant="contained">
              <Icon style={{ color: colors.grey[600] }} icon="ic:outline-layers-clear" />
            </Button>
          </Tooltip>

          <Tooltip title="toggle visibility">
            <Button variant="contained">
              <Icon style={{ color: colors.grey[600] }} icon="mdi:eye" />
            </Button>
          </Tooltip>

          <Tooltip title= {visibleOnDoubleClick ? "Dont make visible hidden items on double click" : "Make visible hidden items on double click" }>
            <Button variant="contained" onClick={() => setVisibleOnDoubleClick(!visibleOnDoubleClick)}>
              <Icon style={{ color: colors.grey[600] }} icon="carbon:change-catalog" />
            </Button>
          </Tooltip>
        </ButtonGroup>
        <div>
          <Box component="div" m="10px" maxHeight="100%" overflow="auto" width="90%">
            {nodes &&
              Array.from(nodes).map((data, index) => (
                <FloatingBox name={data.name} node={data} key={`${data}-${index}`} visibleOnDoubleClick={visibleOnDoubleClick} />
              ))}
          </Box>
        </div>
      </div>
    </>
  );
};

interface TreeNodeBoxProps {
  name: string;
  node: TreeNode<BuildingElement> | undefined;
  visibleOnDoubleClick: boolean;
}

const FloatingBox: React.FC<TreeNodeBoxProps> = ({ name, node, visibleOnDoubleClick = true }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isVisible, setIsVisible] = useState<boolean>(false); // check this

  useEffect(() => {
    console.log("child container", name, node);
  }, []);

  // on double click select 3d geometry
  const handelDoubleClick = () => {
    const highlighter = components.get(OBF.Highlighter);

    if (!node) return;
    const elements = TreeUtils.getChildrenNonNullData(node);
    const idMaps = GetFragmentIdMaps(elements, components);
    // get fragmentID
    if (!idMaps || !idMaps[0]) return;

    if (visibleOnDoubleClick) {
      const cache = components.get(ModelCache);

      // figure out which elements are hidden and if hidden set visibility on fragment
      elements.forEach((element) => {
        const frag = cache.getFragmentByElement(element);
        if (!frag || !frag.hiddenItems.has(element.expressID)) return;
        frag.setVisibility(true, [element.expressID]);
      });
    }

    highlighter.highlightByID("select", idMaps[0], false, false, undefined);
    setIsSelected(true);
  };

  // on hover highlight 3d geometry
  useEffect(() => {
    const highlighter = components.get(OBF.Highlighter);

    if (!node) return;
    const elements = TreeUtils.getChildrenNonNullData(node);
    const idMaps = GetFragmentIdMaps(elements, components);
    // get fragmentID
    if (!idMaps || !idMaps[0]) return;

    if (isHovered) {
      highlighter.highlightByID("hover", idMaps[0], true, false, undefined);
    } else {
      highlighter.clear("hover");
    }
  }, [isHovered]);

  const ToggleVisibility = () => {
    setIsVisible(!isVisible);
    // update visibility
  };

  return (
    <Tooltip title={name} arrow placement="right">
      <Box component="div">
        <Box
          component="div"
          onDoubleClick={() => handelDoubleClick()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            padding: isHovered ? "8px" : "10px",
            width: isHovered ? "95%" : "92%",
            height: "30px",
            margin: "8px 0",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            borderColor: colors.grey[1000],
            border: isSelected ? "1px solid #ccc" : "0.8px solid #ccc",
            backgroundColor: isSelected || isHovered ? colors.grey[800] : colors.grey[1000],
            transition: "all 0.2s ease",
            justifyContent: "space-between",
            overflow: "hidden", // Ensures no overflow issues
          }}
        >
          {/* <Icon icon="system-uicons:boxes" color={isSelected ? colors.primary[100] : colors.grey[500]} /> */}
          <Icon icon="game-icons:wood-beam" color={isSelected || isHovered ? colors.primary[100] : colors.grey[500]} />
          <Typography
            noWrap
            // maxWidth="105px"
            minWidth="20px"
            align="left"
            textAlign="left"
            alignContent="left"
            sx={{
              flexGrow: 1,
              color: isSelected || isHovered ? colors.primary[100] : colors.grey[600],
              ...nonSelectableTextStyle,
              ml: 1,
              display: { xs: "none", sm: "block" },
              variant: isSelected ? "body2" : "body1",
              whiteSpace: "nowrap", // Prevents wrapping
              overflow: "hidden", // Hides overflow content
              textOverflow: "ellipsis", // Adds ellipsis to overflow text
            }}
          >
            {name}
            {/* {displayName} */}
          </Typography>
          <Typography
            noWrap
            variant="body2"
            sx={{
              ...nonSelectableTextStyle,
              marginLeft: "10px",
              color: isSelected || isHovered ? colors.primary[100] : colors.grey[600],
              variant: "body2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: { xs: "none", sm: "block" }, // Responsive: hides on extra small screens
            }}
          >
            Qnt : {node?.children?.size ?? ""}
          </Typography>
          {/* <IconButton
                size="small"
                // color={isSelected ? "primary" : "secondary"}
                sx={{ marginLeft: "8px", color: isSelected ? colors.primary[100] : colors.grey[500] }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  ToggleVisibility();
                }}
              >
                {isVisible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
              </IconButton> */}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default MaterialOverviewPanel;
