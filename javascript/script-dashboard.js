// Retrieve user information from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');
const password = urlParams.get('password');


// Fetch and display other user information from the database
// fetch(`../'php/process_login.php'?id=${userId}`, {
//     method: 'POST'
// })
fetch('../php/process_login.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email, password: password })
})
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Display user information
            document.getElementById('id').value = data.personal_info.id;
            document.getElementById('idid').textContent = data.personal_info.id;
            document.getElementById('name').textContent = `${data.personal_info.fname} ${data.personal_info.lname}`;
            document.getElementById('email').textContent = data.personal_info.email;
            document.getElementById('en_no').textContent = data.personal_info.en_no;
            document.getElementById('dob').textContent = data.personal_info.dob;
            document.getElementById('gender').textContent = data.personal_info.gender;
            document.getElementById('mo_no').textContent = data.contact_info.mo_no;
            document.getElementById('department').textContent = data.contact_info.department;
            document.getElementById('uni_email').textContent = data.contact_info.uni_email;
            document.getElementById('abc_id').textContent = data.contact_info.abc_id;
            document.getElementById('add1').textContent = data.contact_info.add1;
            document.getElementById('add2').textContent = data.contact_info.add2;
            document.getElementById('github').textContent = data.contact_info.github;
            document.getElementById('linkedin').textContent = data.contact_info.linkedin;
            document.getElementById('github').href = data.contact_info.github;
            document.getElementById('linkedin').href = data.contact_info.linkedin;
            // document.getElementById('passport_img').textContent = data.documents.passport_img;
            // document.getElementById('aadhaar_card').textContent = data.documents.aadhaar_card;
            // document.getElementById('pre_academic').textContent = data.documents.pre_academic;
            // document.getElementById('resume').textContent = data.documents.resume;
            // document.getElementById('portfolio').textContent = data.documents.portfolio;
            document.getElementById('passport_img').href = data.documents.passport_img;
            document.getElementById('aadhaar_card').href = data.documents.aadhaar_card;
            document.getElementById('pre_academic').href = data.documents.pre_academic;
            document.getElementById('resume').href = data.documents.resume;
            document.getElementById('portfolio').href = data.documents.portfolio;
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching user data.');
    });

// Update profile function
function updateProfile() {
    const userId = document.getElementById('id').value;
    window.location.href = 'update_profile.html?id='+ userId;
}

// Delete user function
function deleteUser() {
    const userId = document.getElementById('id').value;

    // Send a DELETE request to the server
    fetch(`../php/process_login.php?id=${userId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Profile Deleted Successfully');
                window.location.href = '../index.html';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the user profile.');
        });
}

// Sign out function
function signOut() {
    // Code to handle the sign-out process
    // Redirect to the index page with a success message
    alert('Signout Successfully');
    window.location.href = '../index.html';
}