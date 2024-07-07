// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, get, push, remove, update } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCpTFSvMdTZLE1jCL27bCNiif_r-hnRpYc",
    authDomain: "badminton-dbb4f.firebaseapp.com",
    databaseURL: "https://badminton-dbb4f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "badminton-dbb4f",
    storageBucket: "badminton-dbb4f.appspot.com",
    messagingSenderId: "456029182920",
    appId: "1:456029182920:web:78891fd06e1f9433fcbefd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Fetch and display times from Firebase
document.addEventListener("DOMContentLoaded", () => {
    const timeRef = ref(database, 'Time/');
    get(timeRef).then((snapshot) => {
        if (snapshot.exists()) {
            const times = snapshot.val();
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = ''; // Clear existing content

            Object.keys(times).forEach((key, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${key}</td>
                    <td><button data-key="${key}" class="remove-button">Remove</button></td>
                `;
                tableBody.appendChild(row);
            });

            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const key = event.target.getAttribute('data-key');
                    remove(ref(database, `Time/${key}`)).then(() => {
                        // Remove the row from the table
                        event.target.closest('tr').remove();
                        // Reload times after adding
                        location.reload();
                    }).catch((error) => {
                        console.error(error);
                    });
                });
            });
        } else {
            console.log("No data available for Time");
        }
    }).catch((error) => {
        console.error(error);
    });

    // Add new time
    document.getElementById('addTimeButton').addEventListener('click', () => {
        const newTime = document.getElementById('newTime').value;
        if (newTime) {
            const updates = {};
            updates[`Time/${newTime}`] = "";
            update(ref(database), updates).then(() => {
                // Reload times after adding
                location.reload();
            }).catch((error) => {
                console.error(error);
            });
        } else {
            alert("Please enter a time.");
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = 'settings.html';
    });
});
