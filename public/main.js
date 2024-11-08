console.log("main.js is loaded");


// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Log to ensure Firebase is initialized correctly
console.log("Firebase initialized", app);

// Reference to the DHT_11 node in Firebase Realtime Database
const dhtRef = ref(db, 'DHT_11');

// Listen for changes in DHT_11 data
onValue(dhtRef, (snapshot) => {
  const data = snapshot.val();
  console.log(data); // Log the data to check if it's being fetched correctly

  // Only update the dashboard if the data exists
  if (data) {
    const humidity = data.Humidity;
    const temperature = data.Temperature;
    updateDashboard(humidity, temperature);  // Update the dashboard with the data
  } else {
    console.error("Data is not available or incorrectly structured.");
  }
});

// Function to update the dashboard with the data
function updateDashboard(humidity, temperature) {
  document.getElementById("humidity").innerText = `Humidity: ${humidity}%`;
  document.getElementById("temperature").innerText = `Temperature: ${temperature}°C`;
}

