document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("newBookButton").addEventListener("click", function() {
        window.location.href = "booking.html";
    });
    document.getElementById("booklistButton").addEventListener("click", function() {
        window.location.href = "bookList.html";
    });
});

// Add event listener for back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // Redirect to index.html
});