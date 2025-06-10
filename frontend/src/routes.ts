import { createBrowserRouter} from "react-router";
import NotFoundPage from "./pages/not-found";
import Home from "./pages/home";
import ProtectedLayout from "./layouts/protected-layout";
import SignIn from "./pages/sign-in";

const router = createBrowserRouter([
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Home}
    ]
  },
  {
    path: "/sign-in",
    Component: SignIn,
  },
  {
    path: "*",
    Component: NotFoundPage
  }
]);

export default router
