import "react-router";

export const ROUTES = {
  DASHBOARD: "/dashboard",
  LOGIN: "/sign-in",
  USERS: "/users",
  SETTINGS: "/settings",
};

export type PathParams = unknown;

declare module "react-router" {
  interface Register {
    params: PathParams;
  }
}
