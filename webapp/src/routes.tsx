// src/routes.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Index from './pages/index';
import { Login } from "./components/Login";

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
  },
  {
      path: "/login",
      element: <Login/>
  }

  
];

export default routes;
