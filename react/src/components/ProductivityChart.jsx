import { useDashboardContext } from "@/context/DashboardContextProvider";
import { useStateContext } from "@/context/ContextProvider";
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
  // Title,
} from "chart.js";
import * as Utils from "../assets/utils";
import axiosClient from "@/lib/axios-client";
import moment from "moment";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
  // Title,
);

const COLORS = {
  unproductive: "24.6 95% 53.1%",
  productive: "142.1 76.2% 36.3%",
  neutral: "240 4.8% 95.9%",
};

const getProductivity = async (date, currentTeam) => {
  const { data } = await axiosClient.get(
    `/productivity/team/${currentTeam}/${moment(date).format("YYYY-MM-DD")}`
  );
  return data.data;
};

const ProductivityChart = () => {
  const { date } = useDashboardContext();
  const { currentTeam } = useStateContext();
  const [dataLabel, setDataLabel] = useState([]);
  // const NUMBER_CFG = { count: 30, min: 0, max: 30 };
  const activePeriod = "day";
  const [productive, setProductive] = useState([]);
  const [unproductive, setUnproductive] = useState([]);
  const [neutral, setNeutral] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let tmpProductive = [];
    let tmpUnproductive = [];
    let tmpNeutral = [];

    setIsLoading(true);
    getProductivity(date, currentTeam)
      .then((teamProductivity) => {
        return teamProductivity.sort((a, b) => {
          return a.first_name.localeCompare(b.first_name);
        });
      })
      .then((teamProductivity) => {
        teamProductivity.forEach((app) => {
          tmpUnproductive.push(app.unproductive / 3600);
          tmpProductive.push(app.productive / 3600);
          tmpNeutral.push(app.neutral / 3600);
        });
        setDataLabel(teamProductivity.map((x) => x.first_name));
        setProductive(tmpProductive);
        setUnproductive(tmpUnproductive);
        setNeutral(tmpNeutral);
      })
      .then(() => setIsLoading(false));
  }, [date, currentTeam]);

  useEffect(() => {
    try {
      if (Chart.getChart("track-chart")) {
        Chart.getChart("track-chart").destroy();
      }

      const data = {
        labels: dataLabel,
        datasets: [
          {
            label: "Productive",
            // data: Utils.numbers(NUMBER_CFG),
            data: productive,
            backgroundColor: `hsl(${COLORS.productive})`,
            stack: "productive",
          },
          {
            label: "Neutral",
            // data: Utils.numbers(NUMBER_CFG),
            data: neutral,
            backgroundColor: Utils.CHART_COLORS.grey,
            stack: "neutral",
          },
          {
            label: "Unproductive",
            // data: Utils.numbers(NUMBER_CFG),
            data: unproductive,
            backgroundColor: `hsl(${COLORS.unproductive})`,
            stack: "unproductive",
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
              text: "Chart.js Bar Chart - Stacked",
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
                // display: false,
                drawBorder: true,
                display: true,
                drawOnChartArea: true,
                drawTicks: true,
                borderDash: [5, 5],
              },
              ticks: {
                display: true,
                color: "grey",
                padding: 20,
              },
              afterBuildTicks: function (myChart) {
                let tiktok = myChart.ticks;
                if (activePeriod === "day") {
                  myChart.ticks = [];
                  tiktok.forEach((e) => {
                    myChart.ticks.push(e);
                  });
                }
              },
            },
            y: {
              stacked: true,
              grid: {
                display: true,
                drawBorder: false,
                // display: true,
                drawOnChartArea: true,
                drawTicks: false,
                borderDash: [5, 5],
                color: function (context) {
                  if (context.tick.value === 8) {
                    return "#000";
                  }
                },
              },
              border: {
                display: false,
              },
              gridLines: {
                drawBorder: false,
              },
              ticks: {
                beginAtZero: true,
                display: true,
                padding: 5,
                color: "#000",
                font: {
                  size: 11,
                  family: "Open Sans",
                  style: "normal",
                  lineHeight: 2,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }, [dataLabel, productive, neutral, unproductive]);

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

export default ProductivityChart;
