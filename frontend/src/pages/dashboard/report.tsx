import { StatisticsApi, type UserMonthStatisticsResponse } from "@/lib/api";
import client from "@/lib/api-client";
import { useEffect, useState, type FC } from "react";

import Soup from "@/assets/soup.svg?react";
import Leaf from "@/assets/leaf.svg?react";
import Clock from "@/assets/clock.svg?react";

const api = new StatisticsApi(undefined, undefined, client);

const DashboardReport: FC = () => {
  const [stats, setStats] = useState<UserMonthStatisticsResponse[]>([]);

  useEffect(() => {
    api.statistics().then(({ data }) => setStats(data));
  }, []);
  return (
    <div className="flex-1 p-3 bg-surface rounded">
      <h1 className="text-gray text-h2/h2">Отчет</h1>
      <section className="mt-3">
        <div className="flex gap-3 justify-between text-center px-3">
          <p className="text-gray text-h3/h3">Дата</p>
          <p className="text-gray text-h3/h3">Статистика</p>
          <p className="text-gray text-h3/h3">Экстра</p>
        </div>
        <div>
          {stats.map((item) => (
            <div
              key={item.date}
              className="flex gap-3 justify-between items-center px-3 mt-3 border-b-gray-light border-b-1"
            >
              <div className="text-center">{item.date}</div>
              <div className="text-center">
                {item.statistics?.work_time && (
                  <p className="text-gray flex gap-3 justify-between items-center">
                    {item.statistics?.work_time}
                    <Leaf width={16} height={16} />
                  </p>
                )}
                {item.statistics?.lunch_time && (
                  <p className="text-gray flex gap-3 justify-between items-center">
                    {item.statistics?.lunch_time}
                    <Soup width={16} height={16} />
                  </p>
                )}
                {item.statistics?.break_time && (
                  <p className="text-gray flex gap-3 justify-between items-center">
                    {item.statistics?.break_time}
                    <Clock width={16} height={16} />
                  </p>
                )}
              </div>
              <div className="text-center">{item.extra}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardReport;
