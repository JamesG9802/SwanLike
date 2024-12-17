import ReactDOM from 'react-dom/client';

import { StrictMode } from 'react';

import App from 'App';
import Main, { root_element } from 'main';

/**
 * Entry point for the SwanLike application.
 * @returns 
 */
ReactDOM.createRoot(root_element!).render(
  <StrictMode>
    <Main>
      <App />
    </Main>
  </StrictMode>,
);