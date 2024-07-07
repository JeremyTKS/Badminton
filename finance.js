document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("priceCalButton").addEventListener("click", function() {
        window.location.href = "priceCal.html";
    });
    document.getElementById("paymentButton").addEventListener("click", function() {
        window.location.href = "payment.html";
    });
});

// Add event listener for back button
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // Redirect to index.html
});