import ReactDOM from 'react-dom/client'

import { StrictMode} from 'react';
import { Editor } from 'Editor';
import "index.css";

const root_element = document.getElementById("root");

/**
 * Entry point for the SwanLike Editor.
 * @returns 
 */
function Main() {
  return (
    <>
      <Editor/>
    </>
  );
}

ReactDOM.createRoot(root_element!).render(
  <StrictMode>
    <Main/>
  </StrictMode>,
);