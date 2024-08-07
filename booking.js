import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";

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
    document.getElementById("generate").addEventListener("click", function() {
        // Get selected values
        const date = document.getElementById('date').value;
        const time = document.getElementById('timeSelect').value;
        const venue = document.getElementById('venueSelect').value;

        if (!date || !time || !venue) {
            alert("Please fill out Date, Time, and Venue before generating.");
            return;
        }

        // Combine the values into a single string
        const dataString = JSON.stringify({ date: date, time: time, venue: venue });

        // Encrypt the data string (assuming CryptoJS is properly imported)
        const secretKey = 'JTKS@JieRuiMi@0501@1049'; // Replace with your own secret key
        const encryptedData = CryptoJS.AES.encrypt(dataString, secretKey).toString();

        // Generate a cache-busting random number
        const cacheBuster = Math.random().toString(36).substring(7); // Generate a random string

        // Generate the link with cache buster
        const link = `https://jeremytks.github.io/Badminton/bookLink.html?data=${encodeURIComponent(encryptedData)}&_=${cacheBuster}`;

        // Compose the invitation message
        const invitationMessage = `Badminton Invitation:\nDate: ${date}\nTime: ${time}\nVenue: ${venue}\nLink:\n${link}`;

        // Copy the invitation message to clipboard
        navigator.clipboard.writeText(invitationMessage).then(async () => {
            alert(`Invitation copied to clipboard:\n${invitationMessage}`);

            try {
                // Reference to the booking for this specific date
                const bookingRef = ref(db, `Booking/${date}/`);

                // Fetch existing booking data
                const snapshot = await get(bookingRef);
                const existingData = snapshot.val();

                // Add the new link without replacing other content
                const updatedData = {
                    ...existingData,
                    Link: link
                };

                // Update the booking data with the new link
                await update(bookingRef, updatedData);

                alert(`Link uploaded successfully for ${date}.`);
            } catch (error) {
                console.error("Error uploading link:", error);
                alert("Failed to upload link. Please try again later.");
            }

        }).catch(err => {
            console.error('Failed to copy invitation: ', err);
            alert('Failed to copy invitation. Please copy manually.');
        });
    });

    fetchTimes();
    fetchVenue();
    fetchUsernames();
});

// Function to fetch usernames and populate the dropdown
async function fetchTimes() {
    try {
        const timeRef = ref(db, 'Time');
        const snapshot = await get(timeRef);
        const data = snapshot.val();

        if (data) {
            const timeSelect = document.getElementById('timeSelect');
            for (const time in data) {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                timeSelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error("Error fetching time:", error);
    }
}

// Function to fetch usernames and populate the dropdown
async function fetchVenue() {
    try {
        const venueRef = ref(db, 'Venue');
        const snapshot = await get(venueRef);
        const data = snapshot.val();

        if (data) {
            const venueSelect = document.getElementById('venueSelect');
            for (const venue in data) {
                const option = document.createElement('option');
                option.value = venue;
                option.textContent = venue;
                venueSelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error("Error fetching venue:", error);
    }
}

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
    const time = document.getElementById('timeSelect').value;
    const venue = document.getElementById('venueSelect').value;
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

        // Check if the NameList exists and if the name already exists in it
        if (existingData && existingData.NameList && existingData.NameList[name] !== undefined) {
            alert(`Booking for ${name} on ${date} already exists. Please choose another name.`);
            // Clear the user selection after successful booking
            document.getElementById('userSelect').selectedIndex = 0; // Reset to default selection
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
        update(bookingRef, newData).then(() => {
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

// Add event listener for back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    window.location.href = 'bookingOp.html'; // Redirect to index.html
});
