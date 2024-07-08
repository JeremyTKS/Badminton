import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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

document.addEventListener("DOMContentLoaded", () => {
    const courtTableWrapper = document.getElementById('courtTableWrapper');

    // Function to fetch and display court prices
    const displayCourtPrices = () => {
        courtTableWrapper.innerHTML = ''; // Clear previous content

        const courtPriceRef = ref(database, 'Price/Court/');
        get(courtPriceRef).then((snapshot) => {
            if (snapshot.exists()) {
                const courtPrices = snapshot.val();
                for (const courtname in courtPrices) {
                    const courtnameSection = document.createElement('div');
                    courtnameSection.classList.add('courtname-section');
                    const courtnameHeader = document.createElement('h2');
                    courtnameHeader.textContent = courtname;
                    courtnameSection.appendChild(courtnameHeader);

                    const courtTable = document.createElement('table');
                    courtTable.classList.add('court-table');
                    const courtTableHeader = document.createElement('thead');
                    courtTableHeader.innerHTML = `
                        <tr>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Price (RM)</th>
                            <th>Action</th>
                        </tr>
                    `;
                    const courtTableBody = document.createElement('tbody');
                    for (const day in courtPrices[courtname]) {
                        for (const time in courtPrices[courtname][day]) {
                            const price = parseFloat(courtPrices[courtname][day][time]).toFixed(2); // Format price to 2 decimal places
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${day}</td>
                                <td>${time}</td>
                                <td>${price}</td>
                                <td><button class="delete-button" data-courtname="${courtname}" data-day="${day}" data-time="${time}">Delete</button></td>
                            `;
                            courtTableBody.appendChild(row);
                        }
                    }
                    courtTable.appendChild(courtTableHeader);
                    courtTable.appendChild(courtTableBody);
                    courtnameSection.appendChild(courtTable);

                    courtTableWrapper.appendChild(courtnameSection);
                }
            } else {
                console.log("No court price data available");
            }
        }).catch((error) => {
            console.error("Error fetching court prices:", error);
        });
    };

    // Initial display of court prices
    displayCourtPrices();

    // Add Price button functionality
    const addPriceButton = document.getElementById('addPriceButton');
    addPriceButton.addEventListener('click', () => {
        const courtname = document.getElementById('court').value.trim();
        const day = document.getElementById('day').value.trim();
        const time = document.getElementById('time').value.trim();
        let price = document.getElementById('price').value.trim();

        if (courtname && day && time && price) {
            price = parseFloat(price).toFixed(2); // Format price to 2 decimal places
            const newPrice = {};
            newPrice[time] = price;

            const courtPriceRef = ref(database, `Price/Court/${courtname}/${day}`);
            update(courtPriceRef, newPrice).then(() => {
                console.log("Price added successfully");
                displayCourtPrices(); // Refresh the table after adding
                // Reset input fields
                document.getElementById('court').value = '';
                document.getElementById('day').value = '';
                document.getElementById('time').value = '';
                document.getElementById('price').value = '';
            }).catch((error) => {
                console.error("Error adding price:", error);
            });
        } else {
            console.error("Please fill in all fields");
        }
    });

    // Delete button functionality (event delegation)
    courtTableWrapper.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            const courtname = e.target.dataset.courtname;
            const day = e.target.dataset.day;
            const time = e.target.dataset.time;

            const removeCourt = `${courtname} ${day} ${time}`;

            const timeRef = ref(database, `Price/Court/${courtname}/${day}/${time}`);

            const removeConfirmed = confirm(`Are you sure you want to remove price for ${removeCourt}?`);

            if (removeConfirmed) {
                set(timeRef, null).then(() => {
                    console.log("Price deleted successfully");
                    displayCourtPrices(); // Refresh the table after deleting
                    // Reset input fields
                    document.getElementById('court').value = '';
                    document.getElementById('day').value = '';
                    document.getElementById('time').value = '';
                    document.getElementById('price').value = '';
                }).catch((error) => {
                    console.error("Error deleting price:", error);
                });
            } else {
                console.log(`Removal of ${removeCourt} canceled by the user.`);
            }
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = 'priceSet.html';
    });
});