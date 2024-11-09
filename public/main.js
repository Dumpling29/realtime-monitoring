// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDz3sxm8fzEh85rpndelnCfwlxYNDCwLHY",
  authDomain: "frass-composting.firebaseapp.com",
  databaseURL: "https://frass-composting-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "frass-composting",
  storageBucket: "frass-composting.firebasestorage.app",
  messagingSenderId: "240401182731",
  appId: "1:240401182731:web:1c4adde3f8825c00e9d70e",
  measurementId: "G-FCCKDY1NF9"
};

// Initialize Firebase and database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// References to Chart.js instances for updating data in real-time
let ds1Chart, ds2Chart;

// Initialize the charts when the document is ready
document.addEventListener("DOMContentLoaded", () => {
  ds1Chart = createChart("ds1Chart", "DS1 Temperature Over Time");
  ds2Chart = createChart("ds2Chart", "DS2 Temperature Over Time");
});

// Function to create a line chart using Chart.js
function createChart(canvasId, label) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [], // Time labels
      datasets: [
        {
          label: label,
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time", // Use time scale for x-axis
          time: {
            unit: "minute",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Temperature (°C)",
          },
        },
      },
    },
  });
}

// Listen for changes in the 'sensor' node
const sensorRef = ref(db, 'sensor');

onValue(sensorRef, (snapshot) => {
  const data = snapshot.val();
  
  if (data) {
    const ds1Data = [];
    const ds2Data = [];
    const timeLabels = [];

    // Parse the data structure
    for (const timestamp in data) {
      const time = new Date(parseFloat(timestamp) * 1000); // Convert timestamp to Date object
      const ds1Temp = data[timestamp].DS1;
      const ds2Temp = data[timestamp].DS2;

      // Populate arrays for Chart.js
      timeLabels.push(time);
      ds1Data.push(ds1Temp);
      ds2Data.push(ds2Temp);
    }

    // Update the charts with new data
    updateChart(ds1Chart, timeLabels, ds1Data);
    updateChart(ds2Chart, timeLabels, ds2Data);
  } else {
    console.error("Data is not available or incorrectly structured.");
  }
});

// Function to update Chart.js chart with new data
function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}
