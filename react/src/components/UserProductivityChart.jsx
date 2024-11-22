"use client";

import { useEffect, useState } from "react";
import LoadingOverlay from "react-loading-overlay-ts";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";
import moment from "moment";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

// const rawData = {
//   productive: [
//     { start_time: "2024-11-18T11:00:00", end_time: "2024-11-18T12:00:00" },
//     { start_time: "2024-11-18T12:00:00", end_time: "2024-11-18T12:23:00" },
//   ],
//   unproductive: [
//     { start_time: "2024-11-18T12:23:00", end_time: "2024-11-18T12:32:00" },
//   ],
//   neutral: [
//     { start_time: "2024-11-18T12:32:00", end_time: "2024-11-18T12:45:00" },
//     { start_time: "2024-11-18T12:45:00", end_time: "2024-11-18T13:05:00" },
//   ],
// };

const chartConfig = {
  productive: {
    label: "Productive",
    color: "#34d399",
  },
  unproductive: {
    label: "Unproductive",
    color: "#f87171",
  },
  neutral: {
    label: "Neutral",
    color: "#60a5fa",
  },
  nf: {
    label: "No Files",
    color: "#4683b5",
  },
  om: {
    label: "On Meeting",
    color: "#018180",
  },
};

// Helper function to group data by hour
const groupDataByHour = (data) => {
  const hourDataMap = {};

  Object.keys(data).forEach((category) => {
    const categoryData = data[category];

    if (Array.isArray(categoryData)) {
      categoryData.forEach(({ time, end_time }) => {
        if (typeof time === "string" && typeof end_time === "string") {
          // Parse `time` and `end_time` with a reference date
          const referenceDate = moment().startOf("day"); // Use today's date as reference
          const start = moment(`${referenceDate.format("YYYY-MM-DD")}T${time}`);
          const end = moment(
            `${referenceDate.format("YYYY-MM-DD")}T${end_time}`
          );

          if (!start.isValid() || !end.isValid()) {
            console.error(`Invalid time format: ${time} or ${end_time}`);
            return;
          }

          // Iterate through each hour between start and end
          for (let hour = start.hour(); hour <= end.hour(); hour++) {
            const startOfHour = moment(start)
              .startOf("hour")
              .add(hour - start.hour(), "hours");
            const endOfHour = moment(startOfHour).add(1, "hour");

            const effectiveStart = moment.max(start, startOfHour);
            const effectiveEnd = moment.min(end, endOfHour);

            const duration = moment
              .duration(effectiveEnd.diff(effectiveStart))
              .asSeconds();

            if (!hourDataMap[hour]) {
              hourDataMap[hour] = {
                productive: 0,
                unproductive: 0,
                neutral: 0,
                nf: 0,
                om: 0,
              };
            }

            hourDataMap[hour][category] += duration;
          }
        } else {
          console.error(
            `Invalid time or end_time format for category "${category}":`,
            { time, end_time }
          );
        }
      });
    } else {
      console.error(
        `Expected an array for category "${category}", but got:`,
        categoryData
      );
    }
  });

  // Format result into chart-compatible data
  return Object.entries(hourDataMap)
    .map(([hour, times]) => ({
      hour: moment().hour(hour).format("h A"), // Format hour as '11 AM', '12 PM', etc.
      productive: Math.round(times.productive / 60), // Convert seconds to minutes
      unproductive: Math.round(times.unproductive / 60),
      neutral: Math.round(times.neutral / 60),
      nf: Math.round(times.nf / 60),
      om: Math.round(times.om / 60),
    }))
    .filter(
      (entry) =>
        entry.productive > 0 ||
        entry.unproductive > 0 ||
        entry.neutral > 0 ||
        entry.nf > 0 ||
        entry.om > 0
    ); // Filter only hours with data
};

const UserProductivityChart = ({ dataraw }) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log("UserProductivityChart: ", dataraw);
  // Process raw data
  useEffect(() => {
    setIsLoading(true);
    if (dataraw !== undefined) {
      const groupedData = groupDataByHour(dataraw);
      setChartData(groupedData);
    } else {
      console.log("Empty data");
    }
    setIsLoading(false);
  }, [dataraw]);

  // Initialize or update the chart
  useEffect(() => {
    try {
      if (Chart.getChart("track-chart")) {
        Chart.getChart("track-chart").destroy();
      }

      const data = {
        labels: chartData.map((d) => d.hour),
        datasets: [
          {
            label: chartConfig.productive.label,
            data: chartData.map((d) => d.productive),
            backgroundColor: chartConfig.productive.color,
            stack: "combined", // Stack all categories together
          },
          {
            label: chartConfig.unproductive.label,
            data: chartData.map((d) => d.unproductive),
            backgroundColor: chartConfig.unproductive.color,
            stack: "combined", // Stack all categories together
          },
          {
            label: chartConfig.neutral.label,
            data: chartData.map((d) => d.neutral),
            backgroundColor: chartConfig.neutral.color,
            stack: "combined", // Stack all categories together
          },
          {
            label: chartConfig.nf.label,
            data: chartData.map((d) => d.nf),
            backgroundColor: chartConfig.nf.color,
            stack: "combined", // Stack all categories together
          },
          {
            label: chartConfig.om.label,
            data: chartData.map((d) => d.om),
            backgroundColor: chartConfig.om.color,
            stack: "combined", // Stack all categories together
          },
        ],
      };

      new Chart("track-chart", {
        type: "bar",
        data: data,
        options: {
          plugins: {
            title: {
              display: true,
              text: "Productivity by Hour",
            },
          },
          responsive: true,
          interaction: {
            intersect: false,
          },
          scales: {
            x: {
              stacked: true,
              grid: {
                drawBorder: true,
                display: true,
                borderDash: [5, 5],
              },
              ticks: {
                display: true,
                padding: 10,
                color: "grey",
              },
            },
            y: {
              stacked: true,
              grid: {
                display: true,
                drawBorder: false,
                borderDash: [5, 5],
              },
              ticks: {
                beginAtZero: true,
                display: true,
                padding: 10,
                color: "#000",
                font: {
                  size: 11,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  }, [chartData]);

  return (
    <div className="bg-base-100 rounded-lg border shadow-sm">
      <div className="chart-container overflow-y-auto">
        <LoadingOverlay active={isLoading} spinner text="Loading graph...">
          <canvas id="track-chart"></canvas>
        </LoadingOverlay>
      </div>
    </div>
  );
};

export default UserProductivityChart;
