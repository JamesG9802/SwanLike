import { ThemeProvider } from "@material-tailwind/react";
import "index.css";
import { ReactNode, useEffect } from "react";

export const root_element = document.getElementById("root");

export type MainProps = {
  children: ReactNode
}

export default function Main({ children }: MainProps) {
  function handle_dark_mode(prefers_dark_mode: boolean) {
    root_element?.classList.add(prefers_dark_mode ? "dark" : "light");
    root_element?.classList.remove(prefers_dark_mode ? "light" : "dark");
  }

  //  Adds an event listener to add a corresponding theme to the root HTML element.
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
        {children}
      </ThemeProvider>
    </>
  );
}