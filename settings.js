document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("timeSetButton").addEventListener("click", function() {
        window.location.href = "timeSet.html";
    });
    document.getElementById("venueSetButton").addEventListener("click", function() {
        window.location.href = "venueSet.html";
    });
    document.getElementById("priceSetButton").addEventListener("click", function() {
        window.location.href = "priceSet.html";
    });
});

// Add event listener for back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // Redirect to index.html
});