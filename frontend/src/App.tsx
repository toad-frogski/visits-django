import type { FC } from "react";
import { RouterProvider } from "react-router";
import router from "./routes";
import SessionProvider from "./contexts/session";

const App: FC = () => {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  )
};

export default App;
