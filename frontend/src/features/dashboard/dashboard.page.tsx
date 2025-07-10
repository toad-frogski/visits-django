import type { FC } from "react";
import Report from "./ui/report";
import VisitsTimer from "./ui/visits-timer";
import RedmineTimer from "./ui/redmine-timer";
import Calendar from "./ui/calendar";
import DownloadReport from "./ui/download-report";
import { DashboardProvider } from "./model/dashboard.context";

const DashboardPage: FC = () => {
  return (
    <DashboardProvider>
      <div className="flex flex-col-reverse md:flex-row gap-6">
        <div className="flex-1">
          <Report />
        </div>
        <div className="relative">
          <div className="flex gap-3 justify-between md:flex-col md:justify-start items-end flex-wrap sticky top-6 items-stretch">
            <Calendar />
            <div className="flex gap-3 flex-1 justify-between">
              <VisitsTimer />
              <RedmineTimer />
            </div>
            <DownloadReport />
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
};

export const Component = DashboardPage;
