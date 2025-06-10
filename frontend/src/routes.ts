import { createBrowserRouter} from "react-router";
import MainLayout from './layouts/main-layout';
import NotFoundPage from "./pages/not-found";

const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: NotFoundPage}
    ]
  },
  {
    path: "*",
    Component: NotFoundPage
  }
]);

export default router
