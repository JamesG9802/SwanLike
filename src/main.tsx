// import log from "loglevel";

import ReactDOM from 'react-dom/client'
import { CssBaseline, StyledEngineProvider, ThemeProvider, createTheme, useMediaQuery } from '@mui/material'

import { StrictMode, useEffect } from 'react';
import "index.css";
import App from 'App';

// log.setLevel(0);

const root_element = document.getElementById("root");

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
            container: root_element,
          },
        },
      MuiPopper: {
          defaultProps: {
              container: root_element,
          },
      },
      MuiDialog: {
          defaultProps: {
              container: root_element,
          },
      },
      MuiModal: {
          defaultProps: {
              container: root_element,
          },
      },
  }
});

const lightTheme = createTheme({
  ...darkTheme, 
  palette: { mode: 'light' }
});

export default function Main() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = prefersDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
      root_element?.classList.add(prefersDarkMode ? "dark" : "light");
      root_element?.classList.remove(prefersDarkMode ? "light" : "dark")
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

ReactDOM.createRoot(root_element!).render(
  <StrictMode>
    <Main/>
  </StrictMode>,
);