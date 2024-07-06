import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getDatabase, ref, child, get, remove } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";

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
    // Function to parse query parameters
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            date: params.get('date'),
        };
    }

    // Populate fields with query parameter values
    const queryParams = getQueryParams();
    document.getElementById('date').value = queryParams.date;

    fetchBookingData()

});

async function fetchBookingData() {
    const date = document.getElementById('date').value;
    const bookingRef = ref(db, `Booking/${date}/NameList`);
    const userRef = ref(db, 'User_Data');

    try {
        // Fetch booking data
        const snapshot = await get(bookingRef);
        const bookingData = snapshot.val();

        // Fetch user data to match matric number
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();

        // Populate table with data
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = ''; // Clear previous table rows

        let count = 1;
        for (const name in bookingData) {
            const matricNumber = userData[name]?.MatricNumber || 'Not found';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${count}</td>
                <td>${name}</td>
                <td>${matricNumber}</td>
                <td><button class="removeButton" data-name="${name}">Remove</button></td>
            `;
            tableBody.appendChild(row);
            count++;
        }

        // Add event listeners for remove buttons
        const removeButtons = document.querySelectorAll('.removeButton');
        removeButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const nameToRemove = button.getAttribute('data-name');
                await removeName(date, nameToRemove);
            });
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function removeName(date, nameToRemove) {
    const bookingRef = ref(db, `Booking/${date}/NameList/${nameToRemove}`);
    
    try {
        await remove(bookingRef);
        console.log(`Successfully removed ${nameToRemove} from booking on ${date}`);
        fetchBookingData(); // Refresh the table after removal
    } catch (error) {
        console.error(`Error removing ${nameToRemove}:`, error);
    }
}
