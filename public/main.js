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

// Set up chart variables
let ds1Chart, ds2Chart;

// Function to create charts with time-based x-axis
function createChart(ctx, title) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [], // Timestamps will go here
      datasets: [
        {
          label: title,
          data: [], // Temperature data will go here
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            unit: "minute"
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

// Initialize charts once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const ds1Ctx = document.getElementById("ds1Chart").getContext("2d");
  const ds2Ctx = document.getElementById("ds2Chart").getContext("2d");

  ds1Chart = createChart(ds1Ctx, "DS1 Temperature Over Time");
  ds2Chart = createChart(ds2Ctx, "DS2 Temperature Over Time");
});

// Update chart data dynamically
function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// Fetch and update data from Firebase
const sensorRef = ref(db, 'sensor');

onValue(sensorRef, (snapshot) => {
  const data = snapshot.val();
  console.log("Firebase Data:", data);

  if (data) {
    const labels = [];
    const ds1Data = [];
    const ds2Data = [];

    Object.keys(data).forEach((timestamp) => {
      labels.push(new Date(parseFloat(timestamp) * 1000)); // Convert to JS Date
      ds1Data.push(data[timestamp].DS1);
      ds2Data.push(data[timestamp].DS2);
    });

    updateChart(ds1Chart, labels, ds1Data);
    updateChart(ds2Chart, labels, ds2Data);
  } else {
    console.error("Data is not available or incorrectly structured.");
  }
});
