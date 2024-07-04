import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getDatabase, ref, child, get, remove } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";

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
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    populateDateDropdown();
    
    const fetchButton = document.getElementById('fetchButton');
    fetchButton.addEventListener('click', fetchBookingData);

    const exportButton = document.getElementById('exportButton');
    exportButton.addEventListener('click', exportToCsv);

    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = 'bookingOp.html';
    });
});

async function populateDateDropdown() {
    const dateSelector = document.getElementById('dateSelector');
    const bookingRef = ref(db, 'Booking');

    try {
        const snapshot = await get(bookingRef);
        const bookingData = snapshot.val();

        dateSelector.innerHTML = '<option value="" disabled selected>Select a Date</option>'; // Clear previous options and add default option

        for (const date in bookingData) {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            dateSelector.appendChild(option);
        }
    } catch (error) {
        console.error('Error fetching dates:', error);
    }
}

async function fetchBookingData() {
    const date = document.getElementById('dateSelector').value;
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

function exportToCsv() {
    const table = document.getElementById('tableBody');
    const rows = table.querySelectorAll('tr');

    let csvContent = "data:text/csv;charset=utf-8,";

    rows.forEach((row, index) => {
        const rowData = [];
        const cols = row.querySelectorAll('td, th');

        cols.forEach(col => {
            rowData.push(col.innerText);
        });

        csvContent += rowData.join(',') + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "booking_list.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click(); // Trigger the download
}

// Add event listener for back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    window.location.href = 'bookingOp.html'; // Redirect to index.html
});
