import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'
import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material';

const rootElement = document.getElementById("root");

const darkTheme = createTheme({ 
  palette: { mode: 'dark' },
  typography: {
      fontFamily: [
          "Open Sans",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
          "ui-sans-serif",
          "system-ui",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji"
      ].join(',')
  },
  //  Make portal elements inject into the root element
  //  https://mui.com/material-ui/integrations/interoperability/#tailwind-css
  components: {
      MuiPopover: {
          defaultProps: {
            container: rootElement,
          },
        },
      MuiPopper: {
          defaultProps: {
              container: rootElement,
          },
      },
      MuiDialog: {
          defaultProps: {
              container: rootElement,
          },
      },
      MuiModal: {
          defaultProps: {
              container: rootElement,
          },
      },
  }
});

const lightTheme = createTheme({
  ...darkTheme, 
  palette: { mode: 'light' }
});

function Main() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = prefersDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
      rootElement?.classList.add(prefersDarkMode ? "dark" : "light");
      rootElement?.classList.remove(prefersDarkMode ? "light" : "dark")
  }, [prefersDarkMode]);

  return (
    <>
      <CssBaseline/>
      <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <App/>
          </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Main/>
  </StrictMode>,
)
