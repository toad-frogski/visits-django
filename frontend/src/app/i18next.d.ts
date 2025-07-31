import "i18next";

import common from "@/../public/locales/en/common.json";
import visitsController from "@/../public/locales/en/visits-controller.json";
import auth from "@/../public/locales/en/auth.json";
import dashboard from "@/../public/locales/en/dashboard.json";
import settings from "@/../public/locales/en/settings.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      "visits-controller": typeof visitsController;
      auth: typeof auth;
      dashboard: typeof dashboard;
      settings: typeof settings;
    };
  }
}
