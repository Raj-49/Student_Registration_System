<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Specify the log file path
$logFile = '../form_data_log.txt';

// Open the log file for writing (create if it doesn't exist)
$fileHandle = fopen($logFile, 'a');

// Check if the file was opened successfully
if ($fileHandle) {
    // Get the current timestamp
    $timestamp = date('Y-m-d H:i:s');

    // Write the timestamp to the log file
    fwrite($fileHandle, "Form Submission at: $timestamp\n");

    // Iterate through all POST data and write it to the log file
    foreach ($_POST as $key => $value) {
        fwrite($fileHandle, "$key: $value\n");
    }

    // If there are any uploaded files, log their information as well
    if (!empty($_FILES)) {
        fwrite($fileHandle, "Uploaded Files:\n");
        foreach ($_FILES as $fileKey => $file) {
            fwrite($fileHandle, "$fileKey: " . $file['name'] . " (Size: " . $file['size'] . " bytes)\n");
        }
    }

    // Add a separator for readability
    fwrite($fileHandle, "-------------------------------------------------------------------------------\n");

    // Close the file handle
    fclose($fileHandle);
}

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "web_student_registration";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Personal Information
$fname = isset($_POST['fname']) ? $_POST['fname'] : '';
$lname = isset($_POST['lname']) ? $_POST['lname'] : '';
$email = isset($_POST['email']) ? $_POST['email'] : '';
$en_no = isset($_POST['en_no']) ? $_POST['en_no'] : '';
$password = isset($_POST['password']) ? password_hash($_POST['password'], PASSWORD_DEFAULT) : '';
$dob = isset($_POST['dob']) ? $_POST['dob'] : '';
$gender = isset($_POST['gender']) ? $_POST['gender'] : '';

// Validate required fields
if (empty($fname) || empty($lname) || empty($email) || empty($en_no) || empty($password)) {
    die("Please fill in all required fields.");
}

// First, check for existing email or enrollment number
$check_sql = "SELECT email, en_no FROM personal_info WHERE email = ? OR en_no = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("si", $email, $en_no);
$check_stmt->execute();
$result = $check_stmt->get_result();

if ($result->num_rows > 0) {
    $existing = $result->fetch_assoc();
    if ($existing['email'] === $email) {
        echo json_encode(['status' => 'error', 'message' => 'Email address already exists']);
        exit;
    }
    if ($existing['en_no'] == $en_no) {
        echo json_encode(['status' => 'error', 'message' => 'Enrollment number already exists']);
        exit;
    }
}
$check_stmt->close();

// Insert into personal_info using prepared statement
$sql1 = "INSERT INTO personal_info (fname, lname, email, en_no, password, dob, gender) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt1 = $conn->prepare($sql1);
$stmt1->bind_param("sssisss", $fname, $lname, $email, $en_no, $password, $dob, $gender);

if ($stmt1->execute()) {
    $last_id = $conn->insert_id;
} else {
    echo "Error: " . $stmt1->error;
    exit;
}
$stmt1->close();

// Contact Information
$mo_no = isset($_POST['mo_no']) ? $_POST['mo_no'] : '';
$department = isset($_POST['department']) ? $_POST['department'] : '';
$uni_email = isset($_POST['uni_email']) ? $_POST['uni_email'] : '';
$abc_id = isset($_POST['abc']) ? $_POST['abc'] : '';
$add1 = isset($_POST['add1']) ? $_POST['add1'] : '';
$add2 = isset($_POST['add2']) ? $_POST['add2'] : '';
$github = isset($_POST['github']) ? $_POST['github'] : '';
$linkedin = isset($_POST['linkedin']) ? $_POST['linkedin'] : '';

// Check for existing university email or ABC ID
$check_contact_sql = "SELECT uni_email, abc_id FROM contact_info WHERE uni_email = ? OR abc_id = ?";
$check_contact_stmt = $conn->prepare($check_contact_sql);
$check_contact_stmt->bind_param("ss", $uni_email, $abc_id);
$check_contact_stmt->execute();
$contact_result = $check_contact_stmt->get_result();

if ($contact_result->num_rows > 0) {
    $existing_contact = $contact_result->fetch_assoc();
    if ($existing_contact['uni_email'] === $uni_email) {
        echo json_encode(['status' => 'error', 'message' => 'University email already exists']);
        exit;
    }
    if ($existing_contact['abc_id'] === $abc_id) {
        echo json_encode(['status' => 'error', 'message' => 'ABC ID already exists']);
        exit;
    }
}
$check_contact_stmt->close();

// Insert into contact_info using prepared statement
$sql2 = "INSERT INTO contact_info (id, mo_no, department, uni_email, abc_id, add1, add2, github, linkedin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt2 = $conn->prepare($sql2);
$stmt2->bind_param("iisssssss", $last_id, $mo_no, $department, $uni_email, $abc_id, $add1, $add2, $github, $linkedin);

if (!$stmt2->execute()) {
    echo "Error: " . $stmt2->error;
    exit;
}
$stmt2->close();

// File Upload
$uploadDir = "../upload_document/$last_id/";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// File upload function with validation
function uploadFile($fileInput, $inputName, $uploadDir)
{
    if (isset($_FILES[$fileInput]) && $_FILES[$fileInput]['error'] == 0) {
        $fileName = basename($_FILES[$fileInput]['name']);
        $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);
        $allowedExtensions = [
            // Images
            'jpg',
            'jpeg',
            'png',
            'gif',
            'bmp',

            // Documents
            'pdf',
            'doc',
            'docx',
            'xls',
            'xlsx',
            'ppt',
            'pptx',

            // Web files
            'html',
            'htm',
            'css',
            'js',

            // Text files
            'txt',
            'csv',
            'rtf',

            // Archives
            'zip',
            'rar',
            '7z',

            // Audio/Video
            'mp3',
            'mp4',
            'wav',
            'avi',
            'mov'
        ];

        // Validate file extension
        if (!in_array($fileExt, $allowedExtensions)) {
            return "";
        }

        // Create a unique file name
        $newFileName = $inputName . "_" . time() . "." . $fileExt;
        $targetFilePath = $uploadDir . $newFileName;

        if (move_uploaded_file($_FILES[$fileInput]['tmp_name'], $targetFilePath)) {
            return $targetFilePath;
        }
    }
    return "";
}

$passport_img = uploadFile('passport_img', 'passport_img', $uploadDir);
$aadhaar_card = uploadFile('aadhaar_card', 'aadhaar_card', $uploadDir);
$pre_academic = uploadFile('pre_academic', 'pre_academic', $uploadDir);
$resume = uploadFile('resume', 'resume', $uploadDir);
$portfolio = uploadFile('portfolio', 'portfolio', $uploadDir);

// Insert into documents using prepared statement
$sql3 = "INSERT INTO documents (id, passport_img, aadhaar_card, pre_academic, resume, portfolio) VALUES (?, ?, ?, ?, ?, ?)";
$stmt3 = $conn->prepare($sql3);
$stmt3->bind_param("isssss", $last_id, $passport_img, $aadhaar_card, $pre_academic, $resume, $portfolio);

if ($stmt3->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Registration successful!']);

} else {
    echo json_encode(['status' => 'error', 'message' => 'An error occurred.']);

}
$stmt3->close();

$conn->close();
?>