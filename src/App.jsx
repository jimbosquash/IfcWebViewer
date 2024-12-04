import './styles.css'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useState, useRef, useEffect } from "react"
import { useMode, ColorModeContext } from "./theme"
import * as OBC from "@thatopen/components";
import { ComponentsProvider } from './context/ComponentsContext'
import { AppRouter } from './scenes/global/AppRouter';
import * as FRAGS from "@thatopen/fragments";
import { AuthProvider } from '../src/context/AuthProvider'

function App() {
  const [theme, colorMode] = useMode();
  const [components, setCompenents] = useState(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      console.log("setting OBC.Components")
      setCompenents(new OBC.Components())
      isInitialized.current = true;
    }
  }, [])

  return (
    <>
      <AuthProvider>
        <ColorModeContext.Provider value={colorMode}>
          <ComponentsProvider components={components}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AppRouter />
            </ThemeProvider>
          </ComponentsProvider>
        </ColorModeContext.Provider>
      </AuthProvider>
    </>
  )
}

export default App