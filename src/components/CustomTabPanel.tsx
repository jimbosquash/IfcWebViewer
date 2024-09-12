
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  
  export const CustomTabPanel: React.FC<TabPanelProps> = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        style={{
          height: '86vh',
          width: '100%',
          display: value === index ? 'flex' : 'none',
          flexDirection: 'column',
          overflow:'hidden',
          overflowX:"hidden"
        }}        {...other}
      >
        {value === index && children}
      </div>
    );
  }

  export default CustomTabPanel;