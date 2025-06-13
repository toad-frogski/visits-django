import type { FC } from "react";
import { RouterProvider } from "react-router";
import router from "./routes";

const App: FC = () => {
  return (
    <RouterProvider router={router} />
  )
};

export default App;
