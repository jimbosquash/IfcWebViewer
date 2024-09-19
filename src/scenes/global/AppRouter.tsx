import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import TopDisplay from "../global/TopDisplay";
import TopBarContextProvider from "../../context/TopBarContext";
import { Viewer } from "../viewer";

export const AppRouter = () => {
  return (
    <BrowserRouter>
    <TopBarContextProvider>
      <div style={{ display: "flex",flexDirection: "column",height: "100%", width: "100vw" }}>
        <TopDisplay/>
        <main style={{ flex: 1, padding: "0",display: "flex", overflow: "hidden" }}>
          <Routes>
            {/* <Route path='/' element={<LandingPage/>} /> */}
            <Route path="/*" element={<Layout />}>
              <Route path="" element={<Viewer />} />
            </Route>
          </Routes>
        </main>
      </div>
      </TopBarContextProvider>
    </BrowserRouter>
  );
};
