import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  LoaderFunction,
  ActionFunction,
} from "react-router-dom";
import { Grommet } from "grommet-exp";
import { Grommet as OldGrommet, Spinner } from "grommet";
import { hpe } from "grommet-theme-hpe";
import { Login } from "./components/Login";
// import { AppHeader } from "./components/AppHeader";
import routes from './routes';


const App = () => {

  const router = createBrowserRouter(routes);

  return (
    <Grommet>
      <OldGrommet theme={hpe} background="background-back" full="min">
        <RouterProvider router={router} fallbackElement={<Spinner />} />
      </OldGrommet>
    </Grommet>
  );
};

export default App;
