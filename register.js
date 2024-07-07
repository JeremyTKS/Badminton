// Import the functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

// Web app's Firebase configuration
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

// Get references to Firebase services
const db = getDatabase(app);
const storage = getStorage(app);

document.getElementById("submit").addEventListener('click', async function(e){
    e.preventDefault();

    // Store a reference to the form and input fields
    const form = document.querySelector('form');
    const submitButton = document.getElementById("submit");

    // Disable the submit button to prevent duplicate submissions
    submitButton.disabled = true;

    const nameInput = document.getElementById("name");
    const matricInput = document.getElementById("matric");

    // Check if any of the required fields are empty
    if (nameInput.value === "" || matricInput.value === "") {
        alert("Please fill out all fields.");

        // Re-enable the submit button
        submitButton.disabled = false;
        return;
    }

    try {
        // Check if the name already exists
        const nameRef = ref(db, 'User_Data/' + nameInput.value);
        const nameSnapshot = await get(nameRef);

        if (nameSnapshot.exists()) {
            alert("Name already exists.");

            // Re-enable the submit button
            submitButton.disabled = false;
            return;
        }

        // Check if the matric number already exists in any user data
        const userDataRef = ref(db, 'User_Data');
        const userDataSnapshot = await get(userDataRef);

        if (userDataSnapshot.exists()) {
            const users = userDataSnapshot.val();
            let matricExists = false;

            for (let user in users) {
                if (users[user].MatricNumber === matricInput.value) {
                    matricExists = true;
                    break;
                }
            }

            if (matricExists) {
                alert("Matric number already exists.");

                // Re-enable the submit button
                submitButton.disabled = false;
                return;
            }
        }

        // Set data in Firebase Realtime Database after validation
        await set(ref(db, 'User_Data/' + nameInput.value), {
            Name: nameInput.value,
            MatricNumber: matricInput.value,
        });

        // Reset the form after successful submission
        form.reset();
        alert("Submit Successful!");
    } catch (error) {
        console.error("Error submitting data:", error);
        alert("Error submitting data. Please try again.");
    } finally {
        // Re-enable the submit button
        submitButton.disabled = false;
    }
});

// Add event listener for back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    window.location.href = 'user.html'; // Redirect to index.html
});
