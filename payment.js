import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";

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
        window.location.href = 'finance.html';
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
        let paidCount = 0;
        for (const name in bookingData) {
            const matricNumber = userData[name]?.MatricNumber || 'Not found';
            const payment = bookingData[name] ? 'Paid' : 'Unpaid';
            if (bookingData[name]) paidCount++;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${count}</td>
                <td>${name}</td>
                <td>${matricNumber}</td>
                <td>${payment}</td>
                <td><button class="paymentButton" data-name="${name}" data-paid="${bookingData[name]}">${bookingData[name] ? 'Undo' : 'Pay'}</button></td>
            `;
            tableBody.appendChild(row);
            count++;
        }

        // Update paid count
        document.getElementById('paidCount').textContent = `Number of Paid Users: ${paidCount}`;

        // Add event listeners for payment buttons
        const paymentButtons = document.querySelectorAll('.paymentButton');
        paymentButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const nameToUpdate = button.getAttribute('data-name');
                const isPaid = button.getAttribute('data-paid') === 'true';
                await updatePaymentStatus(date, nameToUpdate, !isPaid);
            });
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function updatePaymentStatus(date, nameToUpdate, status) {
    const bookingRef = ref(db, `Booking/${date}/NameList`);
    
    try {
        await update(bookingRef, { [nameToUpdate]: status });
        console.log(`Successfully updated payment status for ${nameToUpdate} to ${status ? 'Paid' : 'Unpaid'} on ${date}`);
        fetchBookingData(); // Refresh the table after update
    } catch (error) {
        console.error(`Error updating payment status for ${nameToUpdate}:`, error);
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

