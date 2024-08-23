import React from 'react';
import { Tab, TabProps } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../theme'; // Adjust this import path as necessary

interface StyledTabProps extends TabProps {
  index: number;
  selectedColor?: string;
  selectedBackgroundColor?: string;
}

const StyledTab: React.FC<StyledTabProps> = ({
  label,
  index,
  selectedColor,
  selectedBackgroundColor,
  ...otherProps
}) => {
  const colors = tokens(/* your theme mode here, e.g., 'dark' or 'light' */);

  const customSx: SxProps<Theme> = {
    '&.Mui-selected': {
      color: selectedColor || colors.greenAccent[400],
      backgroundColor: selectedBackgroundColor || 'transparent',
    },
  };

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  return (
    <Tab
      label={label}
      {...a11yProps(index)}
      sx={customSx}
      {...otherProps}
    />
  );
};

export default StyledTab;