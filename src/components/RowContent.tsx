import { Box, Typography } from "@mui/material";
import { TreeNode } from "../utilities/Tree";
import { IfcElement } from "../utilities/types";
import { Icon } from "@iconify/react";
import { nonSelectableTextStyle } from "../styles";

export interface RowContentProps {
    name: string;
    icon: string;
    node: TreeNode<IfcElement> | undefined;
    chips?: React.ReactNode[]; // An array of chips (optional), passed as React elements
}


// RowContent component to display name, icon, and any chips passed
export const RowContent: React.FC<RowContentProps> = ({ name, icon, chips }) => {

    return (<Box component="div" display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
        {icon && <Icon icon={icon} style={{ marginLeft: "5px" }} />}
        <Typography
            noWrap
            color={'inherit'}
            sx={{
                flexGrow: 1,
                flexShrink: 1,
                minWidth: 0,
                ...nonSelectableTextStyle,
                ml: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                backgroundColor: 'transparent',
            }}
        >
            {name}
        </Typography>

        {/* Box for chips: takes full available space and aligns chips to the right */}
        <Box component="div" display="flex" alignItems="center" justifyContent="flex-end" sx={{ flexGrow: 1 }}>
            {chips?.map((chip, index) => (
                <Box component="div" key={index} sx={{ ml: 1 }}>
                    {" "}
                    {/* Optional spacing between chips */}
                    {chip}
                </Box>
            ))}
        </Box>
    </Box>)
};

export default RowContent;
