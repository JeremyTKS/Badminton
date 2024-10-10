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
    const urlParams = new URLSearchParams(window.location.search);
    const encryptedData = urlParams.get('data');

    if (encryptedData) {
        const secretKey = 'JTKS@JieRuiMi@0501@1049'; // Use the same secret key used for encryption
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

        // Use the decrypted data
        console.log('Decrypted data:', decryptedData);

        // Set the values in your form or display them as needed
        document.getElementById('date').value = decryptedData.date;
        document.getElementById('time').value = decryptedData.time;
        document.getElementById('venue').value = decryptedData.venue;

        // Make the fields read-only
        document.getElementById('date').readOnly = true;
        document.getElementById('time').readOnly = true;
        document.getElementById('venue').readOnly = true;
    } else {
        console.error('No encrypted data found in the URL.');
    }

    document.getElementById("booklist").addEventListener("click", function() {
        // Get selected values
        const date = document.getElementById('date').value;

        // Combine the values into a single string
        const dataString = JSON.stringify({date: date});

        // Encrypt the data string
        const secretKey = 'JTKS@JieRuiMi@0501'; // Replace with your own secret key
        const encryptedData = CryptoJS.AES.encrypt(dataString, secretKey).toString();

        // Generate a cache-busting random number
        const cacheBuster = Math.random().toString(36).substring(7); // Generate a random string

        // Generate the link with cache buster
        const link = `https://jeremytks.github.io/Badminton/booklinkList.html?data=${encodeURIComponent(encryptedData)}&_=${cacheBuster}`;

        // Redirect to bookinglink.html with query parameters
        window.location.href = link;
    });

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

    if (typeof bookingRef != "undefined") {
        // Fetch existing booking data to determine the next index
        get(bookingRef).then(snapshot => {
            const existingData = snapshot.val();

            // Check if the name already exists in NameList
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
    else{
        console.error("Error fetching booking data:", error);
        alert("Booking does not exist Or Booking had been removed");
    }

}


// Add event listener for submit button
const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', () => {
    submitBooking();
});