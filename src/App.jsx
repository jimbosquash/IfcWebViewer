import './styles.css'
import {Routes, Route,BrowserRouter} from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material';
import {useState, useRef, useEffect} from "react"
import {useMode, ColorModeContext} from "./theme"
import * as FRAGS from "@thatopen/fragments";
import * as OBC from "@thatopen/components";
import ViewerFiber from './scenes/viewer/viewerFiber';
import DashBoard from './scenes/dashboard/dashBoard';
import SetUpIfcComponents from "./components/setUpIfcComponents";
import Layout from './scenes/global/Layout';
import {GetBuildingElements} from "./utilities/IfcUtilities";




function App() {
  const containerRef = useRef<HTMLElement>(null);
  const [ifcFile,setIfcFile] = useState();
  const [components,setComponents] = useState();
  const [theme,colorMode] = useMode();
  const [buildingElements, setBuildingElements] = useState([]);

  const handleIFCLoad = (loadedifcFile) => {
    if(!loadedifcFile)
      return;
    console.log("App: upload complete")
    
    const fetchBuildingElements = async () => {

      console.log("fetching building elements",loadedifcFile)
      if(loadedifcFile && components) {
              const newBuildingElements = await GetBuildingElements(loadedifcFile,components);
              setBuildingElements(newBuildingElements);
              setComponents(components);
              console.log(buildingElements.length," building elements found and set")
      }
    };

    fetchBuildingElements();
    setIfcFile(loadedifcFile);
  }

  useEffect(() => {
    const newComponents = SetUpIfcComponents(containerRef);
    setComponents(newComponents);
  },[])

  // const handleComponentsLoad = (newComponents) => {
  //   if(!newComponents)
  //     return;
  //   console.log("App: upload complete")
  //   setComponents(newComponents);
  // }

  return (
    <>
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <BrowserRouter>
          <div style={{ display: 'flex', height: '100%' }}> {/* Flex container */}
            <main style={{flex: 1, padding: "0"}}>
              <Routes>
                {/* <Route path='/' element={<LandingPage/>} /> */}
                <Route path='/*' element={<Layout onIfcFileLoad={handleIFCLoad}/>} >
                  <Route path='' element={<ViewerFiber ifcModel={ifcFile} components={components}/>} />
                  <Route path='dashboard' element={<DashBoard loadedBuildingElements={buildingElements}/>} />
                </Route>

              </Routes>
            </main>
          </div>
      </BrowserRouter>
    </ThemeProvider>
  </ColorModeContext.Provider>
  </>
  )
}

export default App