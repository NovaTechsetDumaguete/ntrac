import { useDashboardContext } from "@/context/DashboardContextProvider";
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
import * as Utils from "./../assets/utils";
// import { secondsToHuman } from "@/lib/timehash";
import axiosClient from "@/lib/axios-client";
import moment from "moment";
import React, { useRef } from "react";


Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

const COLORS = {
  unproductive: "24.6 95% 53.1%",
  productive: "142.1 76.2% 36.3%",
  neutral: "240 4.8% 95.9%",
};

const getProductivity = async (date, empId) => {
  // const currentUrl = window.location.href;

  // const url = new URL(currentUrl); // 'URL' should start with a capital letter
  // const id = url.pathname.split("/").pop();

  const { data } = await axiosClient.get(
    `/tracking/employee?employee_id=${empId}&date=${moment(date).format("YYYY-MM-DD")}`
  );
  return data.data;
};

const ActivityChart = ({ isLoading, empId }) => {
  const { date } = useDashboardContext();
  const [dataLabel, setDataLabel] = useState(["NAME"]);
  // const NUMBER_CFG = { count: 30, min: 0, max: 30 };
  const activePeriod = "day";
  const [productive, setProductive] = useState([]);
  const [unproductive, setUnproductive] = useState([]);
  const [neutral, setNeutral] = useState([]);
  const progress = useRef(null);
  //const [dataLength, setDataLength] = useState(0);

  /*const isFutureDate = (value) => {
    let d_now = new Date();
    let d_inp = new Date(value);
    return d_now < d_inp;
  };*/


  useEffect(() => {
    getProductivity(date, empId)
      .then((teamProductivity) => {
        teamProductivity.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });

        setDataLabel(teamProductivity.map((x) => x.name)); // Set as X-axis labels
        setProductive(teamProductivity.map((x) => x.type === "1" ? x.duration : ""));
        setUnproductive(teamProductivity.map((x) => x.type === "0" ? x.duration : ""));
        setNeutral(teamProductivity.map((x) => x.type !== "1" && x.type !== "0" ? x.duration : ""));
      })
      .catch((error) => {
        console.error("Error fetching productivity data:", error);
      });
  }, [date, empId]);

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
            data: productive,
            backgroundColor: `hsl(${COLORS.productive})`,
            barThickness: 10,
          },
          {
            label: "Neutral",
            data: neutral,
            backgroundColor: Utils.CHART_COLORS.grey,
            barThickness: 10,
          },
          {
            label: "Unproductive",
            data: unproductive,
            backgroundColor: `hsl(${COLORS.unproductive})`,
            barThickness: 10,
          },
        ],
      };

      new Chart("track-chart", {
        type: "bar",
        data: data,
        options: {
          plugins: {
            animation: {
              duration: 1000,
              onProgress: function (animation) {
                progress.value = animation.currentStep / animation.numSteps;
              },
              onComplete: function (animation) {
                window.setTimeout(function () {
                  progress.value = 0;
                }, 2000);
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let data = parseInt(context.formattedValue.replace(/,/g, ""));
                  let label = context.dataset.label;

                  // let newData = data*3600;
                  let formatedData =
                    secondsToHuman(data) === "" ? "0" : secondsToHuman(data);
                  return `${label}: ${formatedData}`;
                },
              },
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
                    //myChart.ticks.push(e);
                  });
                }
              },
            },
            y: {
              stacked: true,
              grid: {
                display: true,
                drawBorder: false,
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
                callback: function (value) {
                  return secondsToHuman(value);
                }
              },
            },
          },
        },
      });

      function secondsToHuman(seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var result = "";
        if (hours > 0) {
          result += hours + "h ";
        }
        if (minutes > 0 || hours > 0) {
          result += minutes + "m ";
        }
        return result.trim(); // Trim any trailing space
      }

    } catch (error) {
      console.log(error);
    }
  }, [dataLabel, productive, neutral, unproductive]);

  return (
    <div className="bg-base-100 rounded-lg border shadow-sm">
      <div className="chart-container">
        <LoadingOverlay active={isLoading} spinner text="Loading graph...">
          <canvas id="track-chart"></canvas>
        </LoadingOverlay>
      </div>
    </div>
  );
};

export default ActivityChart;


