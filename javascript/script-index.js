// Get all password toggle icons and password fields
// Get both password input fields
const passwordFields = document.querySelectorAll('.pass');
const toggleIcons = document.querySelectorAll('.bxs-lock-alt');

// Add click event listener to each icon
toggleIcons.forEach((icon, index) => {
    icon.addEventListener('click', function () {
        const passwordField = passwordFields[index];

        // Toggle password visibility
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            this.classList.remove('bxs-lock-alt');
            this.classList.add('bxs-lock-open-alt');
        } else {
            passwordField.type = 'password';
            this.classList.remove('bxs-lock-open-alt');
            this.classList.add('bxs-lock-alt');
        }
    });
});







// Get the "Forgot Password" link and the password reset form
const forgotPasswordLink = document.querySelector('.forgot-password');
const resetForm = document.getElementById('reset');

// Get the close button element
const closeButton = document.createElement('button');
closeButton.classList.add('close-button');
closeButton.innerHTML = '<i class="bx bx-x"></i>';

// Add event listener to the "Forgot Password" link
forgotPasswordLink.addEventListener('click', () => {
    resetForm.classList.add('show');
});

// Add event listener to the close button
closeButton.addEventListener('click', () => {
    resetForm.classList.remove('show');
});

// Append the close button to the password reset form
resetForm.appendChild(closeButton);









// Add event listener to the form submission
document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get the email and password values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('php/process_login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'error') {
            // Display an alert with the error message
            alert(data.message);
        } else {
            // Display an alert with the success message and Redirect to the dashboard
            alert(data.message);
            window.location.href = 'html/dashboard.html?email=' + email +'&password=' + password
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});