// src/routes.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Index from './pages/index';

const routes = [
  {
    path: "/",
    element: <Index/>,
  },
  {
    path: "/images",
    element: <Index />
  },
  {
    path: "/artifacts",
    element: <Index/>,
  }
  
];

export default routes;
