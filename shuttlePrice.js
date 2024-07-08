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
    const shuttlecockTableWrapper = document.getElementById('shuttlecockTableWrapper');

    // Function to fetch and display shuttlecock prices
    const displayShuttlecockPrices = () => {
        shuttlecockTableWrapper.innerHTML = ''; // Clear previous content

        const shuttlecockPriceRef = ref(database, 'Price/Shuttlecock/');
        get(shuttlecockPriceRef).then((snapshot) => {
            if (snapshot.exists()) {
                const shuttlecockPrices = snapshot.val();
                for (const brand in shuttlecockPrices) {
                    const brandSection = document.createElement('div');
                    brandSection.classList.add('brand-section');
                    const brandHeader = document.createElement('h2');
                    brandHeader.textContent = brand;
                    brandSection.appendChild(brandHeader);

                    const brandTable = document.createElement('table');
                    brandTable.classList.add('shuttlecock-table');
                    const brandTableHeader = document.createElement('thead');
                    brandTableHeader.innerHTML = `
                        <tr>
                            <th>Model</th>
                            <th>Price (RM)</th>
                            <th>Action</th>
                        </tr>
                    `;
                    const brandTableBody = document.createElement('tbody');
                    for (const model in shuttlecockPrices[brand]) {
                        const price = parseFloat(shuttlecockPrices[brand][model]).toFixed(2); // Format price to 2 decimal places
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${model}</td>
                            <td>${price}</td>
                            <td><button class="delete-button" data-brand="${brand}" data-model="${model}">Delete</button></td>
                        `;
                        brandTableBody.appendChild(row);
                    }
                    brandTable.appendChild(brandTableHeader);
                    brandTable.appendChild(brandTableBody);
                    brandSection.appendChild(brandTable);

                    shuttlecockTableWrapper.appendChild(brandSection);
                }
            } else {
                console.log("No shuttlecock price data available");
            }
        }).catch((error) => {
            console.error("Error fetching shuttlecock prices:", error);
        });
    };

    // Initial display of shuttlecock prices
    displayShuttlecockPrices();

    // Add Price button functionality
    const addPriceButton = document.getElementById('addPriceButton');
    addPriceButton.addEventListener('click', () => {
        const brand = document.getElementById('brand').value.trim();
        const model = document.getElementById('model').value.trim();
        let price = document.getElementById('price').value.trim();

        if (brand && model && price) {
            price = parseFloat(price).toFixed(2); // Format price to 2 decimal places
            const newPrice = {};
            newPrice[model] = price;

            const shuttlecockPriceRef = ref(database, `Price/Shuttlecock/${brand}`);
            update(shuttlecockPriceRef, newPrice).then(() => {
                console.log("Price added successfully");
                displayShuttlecockPrices(); // Refresh the table after adding
                // Reset input fields
                document.getElementById('brand').value = '';
                document.getElementById('model').value = '';
                document.getElementById('price').value = '';
            }).catch((error) => {
                console.error("Error adding price:", error);
            });
        } else {
            console.error("Please fill in all fields");
        }
    });

    // Delete button functionality (event delegation)
    shuttlecockTableWrapper.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            const brand = e.target.dataset.brand;
            const model = e.target.dataset.model;

            const removeShuttle = `${brand} ${model})`;

            const modelRef = ref(database, `Price/Shuttlecock/${brand}/${model}`);

            const removeConfirmed = confirm(`Are you sure you want to remove price for ${removeShuttle}?`);
            
            if (removeConfirmed) {
                set(modelRef, null).then(() => {
                    console.log("Price deleted successfully");
                    displayShuttlecockPrices(); // Refresh the table after deleting
                    // Reset input fields
                    document.getElementById('brand').value = '';
                    document.getElementById('model').value = '';
                    document.getElementById('price').value = '';
                }).catch((error) => {
                    console.error("Error deleting price:", error);
                });
            } else {
                console.log(`Removal of ${removeShuttle} canceled by the user.`);
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