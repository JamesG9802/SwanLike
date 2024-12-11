import ReactDOM from 'react-dom/client'

import { StrictMode } from 'react';
import { Editor } from 'Editor';
import "index.css";

const root_element = document.getElementById("root");

/**
 * Entry point for the SwanLike Editor.
 * @returns 
 */
export default function MainEditor() {
  return (
    <>
      <Editor />
    </>
  );
}

ReactDOM.createRoot(root_element!).render(
  <StrictMode>
    <MainEditor />
  </StrictMode>,
);