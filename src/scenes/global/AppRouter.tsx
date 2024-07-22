import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { ThreeScene } from "../viewer/threeScene";
import ThreeLandingPage from "../landingPage/threeLandingPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100%" }}>
        <main style={{ flex: 1, padding: "0" }}>
          <Routes>
            {/* <Route path='/' element={<LandingPage/>} /> */}
            <Route path="/*" element={<Layout />}>
              <Route path="" element={<ThreeScene />} />
              {/* <Route path='' element={<ThreeViewer/>} /> */}
              {/* <Route path='' element={<WebComponentViewer/>} /> */}
              {/* <Route path='' element={<ThreeScene/>} /> */}
              {/* <Route path='dashboard' element={<DashBoard loadedBuildingElements={buildingElements}/>} /> */}
              {/* <Route path='' element={<ViewerFiber/>} /> */}
              {/* <Route path='dashboard' element={<ThreeLandingPage/>} /> */}
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};
