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

    const removeBookButton = document.getElementById('removeBookButton');
    removeBookButton.addEventListener('click', removeBooking);

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
    const bookingRef = ref(db, `Booking/${date}`);
    const nameListRef = child(bookingRef, 'NameList');
    const userRef = ref(db, 'User_Data');

    if (date){
        try {
            // Fetch booking data
            const snapshot = await get(nameListRef);
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

            // Fetch and display datebook, timebook, venuebook, and link
            const timebookRef = child(bookingRef, 'Time');
            const venuebookRef = child(bookingRef, 'Venue');
            const linkRef = child(bookingRef, 'Link');

            const [timebookSnapshot, venuebookSnapshot, linkSnapshot] = await Promise.all([
                get(timebookRef),
                get(venuebookRef),
                get(linkRef)
            ]);

            document.getElementById('timebook').textContent = `Time: ${timebookSnapshot.val() || 'Not available'}`;
            document.getElementById('venuebook').textContent = `Venue: ${venuebookSnapshot.val() || 'Not available'}`;

            const link = linkSnapshot.val() || 'Not available';
            document.getElementById('Link').innerHTML = `Link: <a href="${link}" target="_blank">${link}</a>`;

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    } else {
        alert("Please select a date.");
    }
}

async function removeBooking() {
    const date = document.getElementById('dateSelector').value;
    const bookingRef = ref(db, `Booking/${date}`);

    if (date){
        // Confirmation dialog
        const removeConfirmed = confirm(`Are you sure you want to remove booking on ${date}?`);

        if (removeConfirmed) {
            try {
                await remove(bookingRef);
                console.log(`Successfully removed booking on ${date}`);
                location.reload(); // Refresh the table after removal
            } catch (error) {
                console.error(`Error removing booking on ${date}:`, error);
            }
        } else {
            console.log(`Removal of booking on ${date} canceled by the user.`);
        }
    } else {
        alert("Please select a date.");
    }
}

async function removeName(date, nameToRemove) {
    const bookingRef = ref(db, `Booking/${date}/NameList/${nameToRemove}`);
    
    // Confirmation dialog
    const userConfirmed = confirm(`Are you sure you want to remove ${nameToRemove} from booking on ${date}?`);
    
    if (userConfirmed) {
        try {
            await remove(bookingRef);
            console.log(`Successfully removed ${nameToRemove} from booking on ${date}`);
            fetchBookingData(); // Refresh the table after removal
        } catch (error) {
            console.error(`Error removing ${nameToRemove}:`, error);
        }
    } else {
        console.log(`Removal of ${nameToRemove} canceled by the user.`);
    }
}

function exportToCsv() {
    const date = document.getElementById('dateSelector').value;
    const table = document.getElementById('bookingTable');
    const rows = Array.from(table.rows);
    
    const csvData = rows.map(row => {
        const cells = Array.from(row.cells);
        return cells.map(cell => `"${cell.textContent}"`).join(',');
    }).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${csvData}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `booking_list_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
