// Import and configure Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue, remove, get} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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
const database = getDatabase(app);

const userTableBody = document.querySelector("#userTable tbody");

// Function to fetch and populate user data in the table
async function fetchAndPopulateUserData() {
    const userDataRef = ref(database, 'User_Data');

    try {
        const snapshot = await get(userDataRef);
        const data = snapshot.val();
        let counter = 1;

        userTableBody.innerHTML = ''; // Clear the table before repopulating

        for (let name in data) {
            let matricNumber = data[name].MatricNumber;
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${counter}</td>
                <td>${name}</td>
                <td>${matricNumber}</td>
                <td><button class="removeButton" data-name="${name}">Remove</button></td>
            `;
            userTableBody.appendChild(row);
            counter++;
        }

        // Add event listeners for remove buttons
        const removeButtons = document.querySelectorAll('.removeButton');
        removeButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const nameToRemove = button.getAttribute('data-name');
                await removeName(nameToRemove);
            });
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function removeName(nameToRemove) {
    const nameRef = ref(database, `User_Data/${nameToRemove}`);

    // Confirmation dialog
    const userConfirmed = confirm(`Are you sure you want to remove ${nameToRemove} from database`);

    if (userConfirmed) {
        try {
            await remove(nameRef);
            console.log(`Successfully removed ${nameToRemove} from User Data`);
            await fetchAndPopulateUserData(); // Fetch updated data and repopulate the table
        } catch (error) {
            console.error(`Error removing ${nameToRemove}:`, error);
        }
    } else {
        console.log(`Removal of ${nameToRemove} canceled by the user.`);
    }
}

// Initial fetch and populate user data
fetchAndPopulateUserData();

// Add event listener for back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    window.location.href = 'user.html'; // Redirect to index.html
});