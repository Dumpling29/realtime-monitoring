console.log("main.js is loaded");


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

console.log("Firebase initialized", app);

// Reference to the DHT_11 node
const dhtRef = ref(db, 'DHT_11');

// Listen for changes in DHT_11 data
onValue(dhtRef, (snapshot) => {
  const data = snapshot.val();
  console.log(data);
  if (data) {
    const humidity = data.Humidity;
    const temperature = data.Temperature;
    updateDashboard(humidity, temperature);  // Call function to display data on the dashboard
  }
});

// Function to update the dashboard display
function updateDashboard(humidity, temperature) {
  document.getElementById("humidity").innerText = `Humidity: ${humidity}%`;
  document.getElementById("temperature").innerText = `Temperature: ${temperature}°C`;
}
