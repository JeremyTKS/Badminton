document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("registerButton").addEventListener("click", function() {
        window.location.href = "register.html";
    });

    document.getElementById("userDataButton").addEventListener("click", function() {
        window.location.href = "userData.html";
    });
});

// Add event listener for back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // Redirect to index.html
});
