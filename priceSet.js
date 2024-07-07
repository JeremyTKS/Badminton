document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("courtSetButton").addEventListener("click", function() {
        window.location.href = "courtPrice.html";
    });
    document.getElementById("shuttleSetButton").addEventListener("click", function() {
        window.location.href = "shuttlePrice.html";
    });
});

// Add event listener for back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    window.location.href = 'settings.html'; // Redirect to index.html
});