console.log("main.js is loaded");

// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDz3sxm8fzEh85rpndelnCfwlxYNDCwLHY",
  authDomain: "frass-composting.firebaseapp.com",
  databaseURL: "https://frass-composting-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "frass-composting",
  storageBucket: "frass-composting.appspot.com",
  messagingSenderId: "240401182731",
  appId: "1:240401182731:web:1c4adde3f8825c00e9d70e",
  measurementId: "G-FCCKDY1NF9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Set up chart variable
let allSensorsChart;

// Function to create chart for all sensors
function createChart(ctx) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [], // Shared time axis for all sensors
      datasets: [] // Dynamically populated for each sensor
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top"
        }
      },
      scales: {
        x: {
          type: "time",
          time: {
            parser: "yyyy-MM-dd'T'HH:mm:ssX", // Parse the ISO timestamp format
            tooltipFormat: "PPpp" // Pretty print timestamps
          },
          title: {
            display: true,
            text: "Time"
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Temperature (°C)"
          }
        }
      }
    }
  });
}

// Initialize chart once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const allSensorsCtx = document.getElementById("allSensorsChart").getContext("2d");
  allSensorsChart = createChart(allSensorsCtx);
});

// Update chart data dynamically
function updateChart(chart, labels, sensorData) {
  chart.data.labels = labels; // Shared timestamps for all sensors
  chart.data.datasets = Object.keys(sensorData).map((sensorId, index) => ({
    label: sensorId, // Sensor ID as the label
    data: sensorData[sensorId],
    borderColor: `hsl(${(index * 360) / 20}, 70%, 50%)`, // Generate a unique color
    borderWidth: 2,
    fill: false
  }));
  chart.update();
}

function downsampleData(data, interval) {
  const aggregatedData = {};
  const timestamps = Object.keys(data);

  timestamps.forEach((timestamp) => {
    const roundedTimestamp = Math.floor(new Date(timestamp).getTime() / interval) * interval;

    Object.keys(data[timestamp]).forEach((sensorId) => {
      if (!aggregatedData[roundedTimestamp]) {
        aggregatedData[roundedTimestamp] = {};
      }

      if (!aggregatedData[roundedTimestamp][sensorId]) {
        aggregatedData[roundedTimestamp][sensorId] = [];
      }

      aggregatedData[roundedTimestamp][sensorId].push(data[timestamp][sensorId]);
    });
  });

  // Calculate averages
  const averagedData = {};
  Object.keys(aggregatedData).forEach((roundedTimestamp) => {
    averagedData[roundedTimestamp] = {};

    Object.keys(aggregatedData[roundedTimestamp]).forEach((sensorId) => {
      const values = aggregatedData[roundedTimestamp][sensorId];
      averagedData[roundedTimestamp][sensorId] =
        values.reduce((sum, value) => sum + value, 0) / values.length;
    });
  });

  return averagedData;
}

// Fetch and update data from Firebase
const sensorRef = ref(db, "Sensor");

const timePeriodSelector = document.getElementById("timePeriod");

timePeriodSelector.addEventListener("change", () => {
  const selectedPeriod = timePeriodSelector.value;
  adjustGraphForPeriod(selectedPeriod);
});

function adjustGraphForPeriod(period) {
  let interval = 60 * 1000; // Default: 1 minute

  if (period === "3d") {
    interval = 60 * 60 * 1000; // 1 hour
  } else if (period === "1w") {
    interval = 6 * 60 * 60 * 1000; // 6 hours
  }

  onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      const downsampledData = downsampleData(data, interval);
      const labels = [];
      const sensorData = {};

      Object.keys(downsampledData).forEach((timestamp) => {
        const date = new Date(parseInt(timestamp, 10));
        labels.push(date);

        const sensors = downsampledData[timestamp];
        Object.keys(sensors).forEach((sensorId) => {
          if (!sensorData[sensorId]) {
            sensorData[sensorId] = [];
          }
          sensorData[sensorId].push({
            x: date,
            y: sensors[sensorId]
          });
        });
      });

      labels.sort((a, b) => a - b);
      updateChart(allSensorsChart, labels, sensorData);
    } else {
      console.error("Data is not available or incorrectly structured.");
    }
  });
}

// Trigger initial data load for the default period
adjustGraphForPeriod(timePeriodSelector.value);

Chart.defaults.animation = false; // Disable animations for large datasets
Chart.defaults.responsive = true; // Maintain responsiveness
