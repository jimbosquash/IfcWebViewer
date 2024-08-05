import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { ThreeScene } from "../viewer/threeScene";
import { TopBar } from "./TopBar";
import TopBarContextProvider from "../../context/TopBarContext";

export const AppRouter = () => {
  return (
    <BrowserRouter>
    <TopBarContextProvider>
      <div style={{ display: "flex",flexDirection: "column",height: "100%", width: "100vw" }}>
        <TopBar/>
        <main style={{ flex: 1, padding: "0",display: "flex", overflow: "hidden" }}>
          <Routes>
            {/* <Route path='/' element={<LandingPage/>} /> */}
            <Route path="/*" element={<Layout />}>
              <Route path="" element={<ThreeScene />} />
            </Route>
          </Routes>
        </main>
      </div>
      </TopBarContextProvider>
    </BrowserRouter>
  );
};
