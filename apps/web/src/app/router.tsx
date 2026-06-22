import { createBrowserRouter } from 'react-router-dom';

import App from '../App';

// Single workbench route for now; conversation selection is held in the Zustand
// store (PRD §12.2), not the URL. Deep-linking by conversation id is a future
// enhancement and can be added here without touching the layout.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
]);
