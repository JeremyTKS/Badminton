import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";

// Your web app's Firebase configuration
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
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("booklist").addEventListener("click", function() {
        // Get selected values
        const date = document.getElementById('date').value;

        // Redirect to bookinglink.html with query parameters
        window.location.href = `booklinkList.html?date=${date}`;
    });
    // Function to parse query parameters
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            date: params.get('date'),
            time: params.get('time'),
            venue: params.get('venue')
        };
    }

    // Populate fields with query parameter values
    const queryParams = getQueryParams();
    document.getElementById('date').value = queryParams.date;
    document.getElementById('time').value = queryParams.time;
    document.getElementById('venue').value = queryParams.venue;

    fetchUsernames();
});

// Function to fetch usernames and populate the dropdown
async function fetchUsernames() {
    try {
        const usersRef = ref(db, 'User_Data');
        const snapshot = await get(usersRef);
        const data = snapshot.val();

        if (data) {
            const userSelect = document.getElementById('userSelect');
            for (const username in data) {
                const option = document.createElement('option');
                option.value = username;
                option.textContent = username;
                userSelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error("Error fetching usernames:", error);
    }
}

function submitBooking() {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const venue = document.getElementById('venue').value;
    const name = document.getElementById('userSelect').value;

    // Check if any field is empty
    if (!date || !time || !venue || !name) {
        alert("Please fill out all fields before submitting.");
        return;
    }

    // Reference to the booking for this specific date and venue
    const bookingRef = ref(db, `Booking/${date}/`);

    // Fetch existing booking data to determine the next index
    get(bookingRef).then(snapshot => {
        const existingData = snapshot.val();

        // Check if the name already exists in NameList
        if (existingData && existingData.NameList && existingData.NameList[name]) {
            alert(`Booking for ${name} on ${date} already exists. Please choose another name.`);
            return;
        }

        // Prepare the new structure to add or update
        const newData = {
            Time: time,
            Venue: venue,
            NameList: {
                ...existingData?.NameList,
                [name]: false  // Initialize payment status to false
            }
        };

        // Set the updated booking data
        set(bookingRef, newData).then(() => {
            alert(`Booking confirmed for ${name} on ${date} at ${time} in ${venue}`);
            // Clear the user selection after successful booking
            document.getElementById('userSelect').selectedIndex = 0; // Reset to default selection
        }).catch(error => {
            console.error("Error adding booking:", error);
            alert("Failed to book. Please try again later.");
        });
    }).catch(error => {
        console.error("Error fetching booking data:", error);
        alert("Failed to fetch booking data. Please try again later.");
    });
}


// Add event listener for submit button
const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', () => {
    submitBooking();
});