// ------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------- custom date filed logic ------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    const dobInput = document.querySelector("#dob");
    flatpickr("#dob", {
        dateFormat: "l, F j, Y",
        altFormat: "F j, Y",
        allowInput: true,
        disableMobile: "true",
    });
});

// ------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------- password show button logic ---------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------ select input filed logic ----------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------

// Select all text inputs and select inputs
const textInputs = document.querySelectorAll('.text-input');
const selectInputs = document.querySelectorAll('.select-input');

// Loop through each pair of text and select inputs
textInputs.forEach((textInput, index) => {
    const selectInput = selectInputs[index];

    function showSelect() {
        textInput.style.display = 'none';
        selectInput.style.display = 'block';
        selectInput.focus();
    }

    function hideSelect() {
        selectInput.style.display = 'none';
        textInput.style.display = 'block';
    }

    textInput.addEventListener('click', showSelect);

    selectInput.addEventListener('change', function () {
        textInput.value = this.options[this.selectedIndex].text;
        hideSelect();
    });

    // Hide select on blur, only if we're not clicking on an option
    selectInput.addEventListener('blur', function () {
        setTimeout(() => {
            if (!document.activeElement || document.activeElement.tagName !== 'OPTION') {
                hideSelect();
            }
        }, 100);
    });

    // Initialize value if needed
    if (selectInput.value) {
        textInput.value = selectInput.options[selectInput.selectedIndex].text;
    }
});

// ------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------- password == confirm password logic--------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------

function validatePasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return false; // Prevent form submission
    }
    return true;
}

// ------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------- file upload logic ---------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------

// Select all the file upload fields
const fileUploadFields = document.querySelectorAll('.file-upload');

fileUploadFields.forEach((field) => {
    const fileList = field.closest('.container-upload').querySelector('#file-list');
    const errorMessage = field.closest('.container-upload').querySelector('#error');

    field.addEventListener('change', () => {
        fileList.innerHTML = '';
        Array.from(field.files).forEach((file) => {
            fileHandler(file, file.name, fileList);
        });
    });

    field.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        field.closest('.container-upload').classList.add('active');
    });

    field.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        field.closest('.container-upload').classList.remove('active');
    });

    field.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        field.closest('.container-upload').classList.add('active');
    });

    field.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        field.closest('.container-upload').classList.remove('active');
        const draggedData = e.dataTransfer;
        const files = draggedData.files;
        fileList.innerHTML = '';
        Array.from(files).forEach((file) => {
            fileHandler(file, file.name, fileList);
        });
    });
});

const fileHandler = (file, name, fileList) => {
    let fileItem = document.createElement("li");
    let fileLink = document.createElement("a");
    let removeButton = document.createElement("button");

    fileLink.href = URL.createObjectURL(file);
    fileLink.target = "_blank";
    fileLink.textContent = name;

    // Create the Box Icon element
    let boxIcon = document.createElement("box-icon");
    boxIcon.setAttribute("type", "solid");
    boxIcon.setAttribute("name", "x-square");

    // Append the Box Icon to the remove button
    removeButton.appendChild(boxIcon);

    removeButton.addEventListener("click", () => {
        fileItem.remove();
    });

    fileItem.appendChild(fileLink);
    fileItem.appendChild(removeButton);
    fileList.appendChild(fileItem);
};

// ------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------- Progress Bar and button logic ------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------

let signupContent1 = document.querySelector(".stage1-content"),
    signupContent2 = document.querySelector(".stage2-content"),
    signupContent3 = document.querySelector(".stage3-content");

signupContent2.style.display = "none";
signupContent3.style.display = "none";

const progressText = document.querySelectorAll(".step p");
const progressCheck = document.querySelectorAll(".step .check");
const bullet = document.querySelectorAll(".step .bullet");

let current = 1;

// Function to check if all fields in a stage are filled
function areAllFieldsFilled(stage) {
    const inputs = stage.querySelectorAll("input[required]:not([type='file']), select[required]");
    return Array.from(inputs).every(input => {
        if (input.type === "select-one") {
            return input.value !== "" && input.value !== null;
        }
        return input.value.trim() !== "";
    });
}

// Function to check if all files are uploaded by checking file list items
function areAllFilesUploaded(stage) {
    const fileContainers = stage.querySelectorAll('.container-upload');
    return Array.from(fileContainers).every(container => {
        const fileList = container.querySelector('#file-list');
        return fileList && fileList.children.length > 0;
    });
}

// Function to update progress bar
function updateProgressBar() {
    // Reset all steps first
    bullet.forEach((item, index) => {
        item.classList.remove("active");
        progressCheck[index].classList.remove("active");
        progressText[index].classList.remove("active");
    });

    // Update steps based on current progress
    for (let i = 0; i < current; i++) {
        if (i === 0 && areAllFieldsFilled(signupContent1)) {
            bullet[i].classList.add("active");
            progressCheck[i].classList.add("active");
            progressText[i].classList.add("active");
        }
        if (i === 1 && areAllFieldsFilled(signupContent2)) {
            bullet[i].classList.add("active");
            progressCheck[i].classList.add("active");
            progressText[i].classList.add("active");
        }
        if (i === 2 && areAllFilesUploaded(signupContent3)) {
            bullet[i].classList.add("active");
            progressCheck[i].classList.add("active");
            progressText[i].classList.add("active");
        }
    }
}

// Monitor stage 1 inputs
signupContent1.querySelectorAll("input[required], select[required]").forEach(input => {
    input.addEventListener("input", updateProgressBar);
});

// Monitor stage 2 inputs
signupContent2.querySelectorAll("input[required], select[required]").forEach(input => {
    input.addEventListener("input", updateProgressBar);
});

// Monitor file list changes for progress bar updates
const fileListObserver = new MutationObserver(updateProgressBar);
document.querySelectorAll('#file-list').forEach(fileList => {
    fileListObserver.observe(fileList, { childList: true });
});

function stage1to2() {
    if (areAllFieldsFilled(signupContent1)) {
        signupContent1.style.display = "none";
        signupContent2.style.display = "block";
        signupContent3.style.display = "none";
        current = 2;
        updateProgressBar();
    } else {
        alert("Please fill all required fields before proceeding to the next stage.");
    }
}

function stage2to1() {
    signupContent1.style.display = "block";
    signupContent2.style.display = "none";
    signupContent3.style.display = "none";
    current = 1;
    updateProgressBar();
}

function stage2to3() {
    if (areAllFieldsFilled(signupContent2)) {
        signupContent1.style.display = "none";
        signupContent2.style.display = "none";
        signupContent3.style.display = "block";
        current = 3;
        updateProgressBar();
    } else {
        alert("Please fill all required fields before proceeding to the next stage.");
    }
}

function stage3to2() {
    signupContent1.style.display = "none";
    signupContent2.style.display = "block";
    signupContent3.style.display = "none";
    current = 2;
    updateProgressBar();
}

const submitBtn = document.querySelector(".submit");
const form = document.getElementById('registrationForm');

submitBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    // Special Email Input - Update Email with 10-digit number + fixed domain
    let specialNumber = document.getElementById("uni_number").value;
    const fixedDomain = ".adit@cvmu.edu.in";
    let fullEmail = specialNumber + fixedDomain;
    document.getElementById("uni_email").value = fullEmail;
    const specialEmail = document.getElementById("uni_email").value;
    console.log("Submitting Special Email: " + specialEmail);

    // Check if all required files are uploaded
    if (!areAllFilesUploaded(signupContent3)) {
        alert("Please upload all required documents before submitting.");
        return;
    }

    // Confirm form submission
    const userConfirmed = confirm("Do you want to submit the form?");
    if (!userConfirmed) {
        return;
    }

    const formData = new FormData(form);

    // Debug logging
    console.log('Files being uploaded:', {
        passport_img: document.getElementById('passport_img').files[0],
        aadhaar_card: document.getElementById('aadhaar_card').files[0],
        pre_academic: document.getElementById('pre_academic').files[0],
        resume: document.getElementById('resume').files[0]
    });

    try {
        const response = await fetch('../php/process_registration.php', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (data.status === 'success') {
            alert(data.message);
            window.location.href = '../index.html';
        } else {
            // Handle specific error cases
            switch (data.message) {
                case 'Email address already exists':
                    alert('This email is already registered. Please use a different email address.');
                    document.getElementById('email').focus();
                    break;
                case 'Enrollment number already exists':
                    alert('This enrollment number is already registered. Please check your number.');
                    document.getElementById('en_no').focus();
                    break;
                case 'University email already exists':
                    alert('This university email is already registered. Please check your email.');
                    document.getElementById('uni_email').focus();
                    break;
                case 'ABC ID already exists':
                    alert('This ABC ID is already registered. Please check your ID.');
                    document.getElementById('abc').focus();
                    break;
                default:
                    alert('Registration failed: ' + data.message);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration. Please try again.');
    }
});

// Initial progress bar setup
updateProgressBar();

// ------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------- Number and email input filed setting -------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------

// Initialize the input with zeros on focus
function initNumberInput(input, placeholder) {
    if (!input.value) {
        input.value = placeholder;
        input.dataset.placeholder = placeholder;
    }
    // input.setSelectionRange(0, 0);
     // Set cursor at the beginning
}

// Handle input replacement of zeros (numbers)
function handleNumberInput(input) {
    const placeholder = input.dataset.placeholder;
    let value = input.value.replace(/\D/g, ''); // Remove non-digit characters

    // Ensure the value has the correct number of digits by adding zeros at the left
    const combined = (placeholder + value).slice(-placeholder.length);
    input.value = combined; // Ensure the length is always the same as the placeholder

    // If the value is smaller than the placeholder length, add leading zeros
    let zeroPadding = placeholder.length - value.length;
    if (zeroPadding > 0) {
        input.value = '0'.repeat(zeroPadding) + value; // Add leading zeros back
    }

    // Restrict cursor position to the first entered digit
    // input.setSelectionRange(input.value.length, input.value.length);
}

function appear(input) {
    document.getElementById("uni_domain").value = ".adit@cvmu.edu.in";
}

// Initialize the ABC input with formatted zeros
function initABCInput(input, placeholder) {
    if (!input.value) {
        input.value = placeholder;
        input.dataset.placeholder = placeholder;
    }
}

// Handle ABC input with leading zeros and dash formatting
function handleABCInput(input) {
    const placeholder = input.dataset.placeholder || "000000000000"; // Placeholder for padding
    let value = input.value.replace(/\D/g, ''); // Remove non-digit characters

    // Add leading zeros to the input value based on the placeholder length
    const combined = (placeholder + value).slice(-placeholder.length);

    // Limit to 12 digits and apply the dash formatting
    value = combined.slice(0, 12); // Ensure max 12 digits

    // Format the value with dashes as ABC ID format
    input.value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 9)}-${value.slice(9, 12)}`.replace(/-+$/, '');

    // Restrict cursor position to the first entered digit
    input.setSelectionRange(input.value.length, input.value.length);
}


// Special Email Input - Update Email with 10-digit number + fixed domain



// ------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------- End ------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------
