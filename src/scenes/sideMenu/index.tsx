import { BimSettings } from "./src/BimSettings"
interface sideBarProps {
    isVisible: boolean;
}

export const SideMenu : React.FC<sideBarProps> = ({isVisible}) => {
    return(
        <div className="sideMenu"
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: "100vh",
            margin: '0 auto',
            width: '100%',
          }}>
        {isVisible && <BimSettings/>}
        </div>
    )
}