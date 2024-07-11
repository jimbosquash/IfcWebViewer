import { useContext } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useModelContext} from "../../context/ModelStateContext"
import { GetBuildingElements } from "../../utilities/IfcUtilities"
import Layout from "./Layout"
import * as FRAGS from "@thatopen/fragments";
import { ComponentsContext } from "../../context/ComponentsContext"
import { setUpGroup } from "../../utilities/BuildingElementUtilities"
import { VisibilityStateManager } from "../../components/VisibilityStateManager"
import { ThreeScene } from "../viewer/threeScene"
import ThreeLandingPage from "../landingPage/threeLandingPage"


export const AppRouter = () => {
    const {setCurrentModel,setBuildingElements, setGroups, setGroupVisibility} = useModelContext();
    const components = useContext(ComponentsContext)

    // this location is a code smell
    const handleIFCLoad = (loadedifcFile: FRAGS.FragmentsGroup | undefined) => {
        if(!loadedifcFile || !components)return;
        
        const fetchBuildingElements = async () => {
            console.log("fetching building elements",loadedifcFile)
            const newBuildingElements = await GetBuildingElements(loadedifcFile,components);
            setCurrentModel(loadedifcFile)
            setBuildingElements(newBuildingElements);
            const mappedGroups = setUpGroup(newBuildingElements);
            console.log(mappedGroups);
            setGroups(mappedGroups);

            const vals = Array.from(mappedGroups.values());
            const keys = vals.flatMap(a => Array.from(a.keys()));
            const map = new Map(keys.map(name => [name,true]));

            setGroupVisibility(map)

          };
          fetchBuildingElements();
        }

    return (
        <BrowserRouter>
            <div style={{ display: 'flex', height: '100%' }}>
              <main style={{flex: 1, padding: "0"}}>
                <Routes>
                  {/* <Route path='/' element={<LandingPage/>} /> */}
                  <Route path='/*' element={<Layout onIfcFileLoad={handleIFCLoad}/>} >
                  <Route path='' element={<ThreeScene/>} />
                  {/* <Route path='' element={<ThreeViewer/>} /> */}
                  {/* <Route path='' element={<WebComponentViewer/>} /> */}
                    {/* <Route path='' element={<ThreeScene/>} /> */}
                    {/* <Route path='dashboard' element={<DashBoard loadedBuildingElements={buildingElements}/>} /> */}
                    {/* <Route path='' element={<ViewerFiber/>} /> */}
                    {/* <Route path='dashboard' element={<ThreeLandingPage/>} /> */}
                  </Route>

                </Routes>
              </main>
              <VisibilityStateManager/>
            </div>
        </BrowserRouter>
    )
}