import ReactDOM from 'react-dom/client';

import { StrictMode } from 'react';

import Editor from 'Editor';
import Main, { root_element } from 'main';

/**
 * Entry point for the SwanLike Editor.
 * @returns 
 */
ReactDOM.createRoot(root_element!).render(
  <StrictMode>
    <Main>
      <Editor />
    </Main>
  </StrictMode>,
);