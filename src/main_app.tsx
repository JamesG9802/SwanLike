import ReactDOM from 'react-dom/client';

import { StrictMode, useEffect } from 'react';

import App from 'App';
import { root_element } from 'main';
import { ThemeProvider } from "@material-tailwind/react";

import "index.css";
/**
 * Entry point for the SwanLike application.
 * @returns 
 */
export default function MainApplication() {
  function handle_dark_mode(prefers_dark_mode: boolean) {
    root_element?.classList.add(prefers_dark_mode ? "dark" : "light");
    root_element?.classList.remove(prefers_dark_mode ? "light" : "dark");
  }

  useEffect(() => {
    handle_dark_mode(window.matchMedia("(prefers-color-scheme: dark)").matches);

    window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", event => handle_dark_mode(event.matches));

    return () => {
      window
      .matchMedia("(prefers-color-scheme: dark)")
      .removeEventListener("change", event => handle_dark_mode(event.matches));
    }
  }, []);

  return (
    <>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </>
  );
}

ReactDOM.createRoot(root_element!).render(
  <StrictMode>
    <MainApplication />
  </StrictMode>,
);