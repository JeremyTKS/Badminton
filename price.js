// Import the functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

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
const db = getDatabase(app); // Initialize the database

// DOM elements
const resetButton = document.getElementById('resetButton');
const courtSelector = document.getElementById('courtSelector');
const daySelector = document.getElementById('daySelector');
const timeSelector = document.getElementById('timeSelector');
const shuttlecockBrand = document.getElementById('shuttlecockBrand');
const shuttlecockModel = document.getElementById('shuttlecockModel');
const numCourtInput = document.getElementById('numCourtInput');
const hoursInput = document.getElementById('hoursInput');
const quantityInput = document.getElementById('quantityInput');
const courtPriceDisplay = document.getElementById('courtPrice');
const shuttlecockPriceDisplay = document.getElementById('shuttlecockPrice');
const addShuttlecockButton = document.getElementById('addShuttlecockButton');
const totalPriceDisplay = document.getElementById('totalPrice');
const calculateButton = document.getElementById('calculateButton');
const submitButton = document.getElementById('submitButton');
const backButton = document.getElementById('backButton');

let shuttlecockSelections = []; // Array to store shuttlecock selections

let totalCourtPrice = 0;
let totalShuttlecockPrice = 0;
let totalPrice = 0;
let pricePerPax = 0;

document.addEventListener('DOMContentLoaded', () => {
    populateDateDropdown();
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

// Populate court options
const courtRef = ref(db, 'Price/Court');
get(courtRef).then((snapshot) => {
    snapshot.forEach((courtSnapshot) => {
        const courtName = courtSnapshot.key;
        const option = document.createElement('option');
        option.textContent = courtName;
        option.value = courtName;
        courtSelector.appendChild(option);
    });
}).catch((error) => {
    console.error('Error fetching court options:', error);
});

// Event listener for court selection
courtSelector.addEventListener('change', () => {
    const selectedCourt = courtSelector.value;
    if (selectedCourt) {
        // Populate day options based on selected court
        const courtDayRef = ref(db, `Price/Court/${selectedCourt}`);
        get(courtDayRef).then((snapshot) => {
            daySelector.innerHTML = '<option value="" disabled selected>Select a Day</option>';
            snapshot.forEach((daySnapshot) => {
                const day = daySnapshot.key;
                const option = document.createElement('option');
                option.textContent = day;
                option.value = day;
                daySelector.appendChild(option);
            });
        }).catch((error) => {
            console.error('Error fetching day options:', error);
        });
    }
});

// Event listener for day selection
daySelector.addEventListener('change', () => {
    const selectedCourt = courtSelector.value;
    const selectedDay = daySelector.value;
    if (selectedCourt && selectedDay) {
        // Populate time options based on selected court and day
        const courtTimeRef = ref(db, `Price/Court/${selectedCourt}/${selectedDay}`);
        get(courtTimeRef).then((snapshot) => {
            timeSelector.innerHTML = '<option value="" disabled selected>Select a Time</option>';
            snapshot.forEach((timeSnapshot) => {
                const time = timeSnapshot.key;
                const option = document.createElement('option');
                option.textContent = time;
                option.value = time;
                timeSelector.appendChild(option);
            });
        }).catch((error) => {
            console.error('Error fetching time options:', error);
        });
    }
});

// Populate shuttlecock brand options
const shuttlecockRef = ref(db, 'Price/Shuttlecock');
get(shuttlecockRef).then((snapshot) => {
    snapshot.forEach((shuttlecockSnapshot) => {
        const brand = shuttlecockSnapshot.key;
        const option = document.createElement('option');
        option.textContent = brand;
        option.value = brand;
        shuttlecockBrand.appendChild(option);
    });
}).catch((error) => {
    console.error('Error fetching shuttlecock Brand options:', error);
});

// Event listener for shuttlecock brand selection
shuttlecockBrand.addEventListener('change', () => {
    const selectedBrand = shuttlecockBrand.value;
    if (selectedBrand) {
        // Clear existing options
        shuttlecockModel.innerHTML = '<option value="" disabled selected>Select a Model</option>';

        // Populate shuttlecock model options based on selected brand
        const shuttlecockModelRef = ref(db, `Price/Shuttlecock/${selectedBrand}`);
        get(shuttlecockModelRef).then((snapshot) => {
            snapshot.forEach((modelSnapshot) => {
                const model = modelSnapshot.key;
                const option = document.createElement('option');
                option.textContent = model;
                option.value = model;
                shuttlecockModel.appendChild(option);
            });
        }).catch((error) => {
            console.error('Error fetching shuttlecock models:', error);
        });
    }
});

// Event listener for Add Shuttlecock button
addShuttlecockButton.addEventListener('click', () => {
    const selectedBrand = shuttlecockBrand.value;
    const selectedModel = shuttlecockModel.value;
    const quantity = parseInt(quantityInput.value);

    if (selectedBrand && selectedModel && quantity > 0) {
        // Fetch shuttlecock price (which is for a pack of 12)
        const shuttlecockPriceRef = ref(db, `Price/Shuttlecock/${selectedBrand}/${selectedModel}`);
        get(shuttlecockPriceRef).then((snapshot) => {
            const shuttlecockPricePerPack = snapshot.val() || 0;
            const shuttlecocunitkPrice = shuttlecockPricePerPack / 12;
            const shuttlecockPrice = shuttlecocunitkPrice * quantity; // Calculate total price for the selected quantity
            shuttlecockSelections.push({
                brand: selectedBrand,
                model: selectedModel,
                quantity: quantity,
                unitprice: shuttlecocunitkPrice,
                price: shuttlecockPrice
            });

            // Display current selections and total price
            displayShuttlecockSelections();
        }).catch((error) => {
            console.error('Error fetching shuttlecock price:', error);
        });
    } else {
        alert('Please select brand, model, and enter a valid quantity.');
    }
});

// Event listener for reset button
resetButton.addEventListener('click', () => {
    location.reload()
});

// Function to display shuttlecock selections and total price
function displayShuttlecockSelections() {
    let totalPrice = 0;
    let selectionsHTML = '';
    shuttlecockSelections.forEach((selection, index) => {
        selectionsHTML += `<p>${selection.brand} - ${selection.model}, Quantity: ${selection.quantity} (RM ${selection.unitprice.toFixed(2)} per unit)</p>`;
        totalPrice += selection.price;
    });
    shuttlecockPriceDisplay.innerHTML = `Shuttlecock Price: RM ${totalPrice.toFixed(2)}<br>${selectionsHTML}`;
}

// Function to count names under Booking/Date/NameList
async function countNamesInDate(selectedDate) {
    const nameListRef = ref(db, `Booking/${selectedDate}/NameList`);
    try {
        const snapshot = await get(nameListRef);
        
        // Check if snapshot exists and has children
        if (snapshot.exists()) {
            let nameCount = 0;
            snapshot.forEach(childSnapshot => {
                nameCount++; // Increment for each child (name)
            });
            return nameCount;
        } else {
            return 0; // Return 0 if no names found
        }
    } catch (error) {
        console.error('Error counting names:', error);
        return 1; // Default to 1 if error or no names found
    }
}

// Calculate total price per pax
calculateButton.addEventListener('click', async () => {
    const selectedDate = document.getElementById('dateSelector').value;
    const selectedCourt = courtSelector.value;
    const selectedDay = daySelector.value;
    const selectedTime = timeSelector.value;
    const numCourt = parseInt(numCourtInput.value) || 1;
    const hours = parseInt(hoursInput.value) || 1; // Ensure hours default to 1 if input is empty

    if (selectedDate && selectedCourt && selectedDay && selectedTime) {
        // Fetch court price
        const courtPriceRef = ref(db, `Price/Court/${selectedCourt}/${selectedDay}/${selectedTime}`);
        try {
            const courtSnapshot = await get(courtPriceRef);
            const courtPrice = courtSnapshot.val() || 0;
            totalCourtPrice = courtPrice * numCourt * hours;

            // Calculate total shuttlecock price
            totalShuttlecockPrice = 0;
            shuttlecockSelections.forEach((selection) => {
                totalShuttlecockPrice += selection.price;
            });

            // Calculate total price
            totalPrice = totalCourtPrice + totalShuttlecockPrice;
            
            // Fetch and calculate name count
            const nameCount = await countNamesInDate(selectedDate);

            // Calculate price per pax
            pricePerPax = totalPrice / nameCount;
            totalPriceDisplay.textContent = `Price per pax: RM ${pricePerPax.toFixed(2)} (Total RM ${totalPrice.toFixed(2)})`;

            // Display total court price
            courtPriceDisplay.textContent = `Court Price: RM ${totalCourtPrice.toFixed(2)} (RM ${courtPrice.toFixed(2)} per hour)`;

        } catch (error) {
            console.error('Error fetching prices:', error);
        }
    } else {
        alert('Please select all options to calculate the total price.');
    }
});

// Event listener for submit button
submitButton.addEventListener('click', async () => {
    const selectedDate = document.getElementById('dateSelector').value;

    if (selectedDate && totalPrice > 0) {
        try {
            // Update or add calculated price to Firebase under the selected date
            const bookingDateRef = ref(db, `Booking/${selectedDate}/Price`);
            await update(bookingDateRef, {
                Court_Price: 'RM '+ totalCourtPrice.toFixed(2),
                Shuttlecock_Price: 'RM '+ totalShuttlecockPrice.toFixed(2),
                Total_Price: 'RM '+ totalPrice.toFixed(2),
                Price_per_Pax: 'RM '+ pricePerPax.toFixed(2),
            });

            alert('Price details updated successfully!');
        } catch (error) {
            console.error('Error updating price details:', error);
        }
    } else {
        alert('Please calculate the total price before submitting.');
    }
});

// Event listener for back button
backButton.addEventListener('click', () => {
    window.location.href = 'finance.html'; // Redirect to index.html or appropriate page
});