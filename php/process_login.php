<?php
// Database connection details
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "web_student_registration";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the request method
$requestMethod = $_SERVER['REQUEST_METHOD'];


if ($requestMethod == 'POST') {   
    $email =json_decode(file_get_contents("php://input"), true)['email'] ?? '';
    $password = json_decode(file_get_contents("php://input"), true)['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(array("status" => "error", "message" => "Email or Password is missing"));
        exit;
    }

    // Sanitize inputs
    $email = mysqli_real_escape_string($conn, $email);
    $password = mysqli_real_escape_string($conn, $password);

    // Fetch user ID and hashed password from the database
    $result = mysqli_query($conn, "SELECT id, password FROM personal_info WHERE email='$email'");
    $row = mysqli_fetch_assoc($result);

    if ($row) {
        $userId = $row['id'];
        $hashedPassword = $row['password'];

        // Verify the password              
        if (password_verify($password, $hashedPassword)) {
            // Fetch data from the three tables
            $sql = "SELECT 
                p.id, p.fname, p.lname, p.email, p.en_no, p.dob, p.gender,
                c.mo_no, c.department, c.uni_email, c.abc_id, c.add1, c.add2, c.github, c.linkedin,
                d.passport_img, d.aadhaar_card, d.pre_academic, d.resume, d.portfolio
            FROM personal_info p
            JOIN contact_info c ON p.id = c.id
            JOIN documents d ON p.id = d.id
            WHERE p.id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();

                // Log user activity
                $logFile = '../form_data_log.txt';
                $logEntry = "User " . $row['fname'] . " " . $row['lname'] . " with ID " . $userId . " has Logged in on " . date("Y-m-d H:i:s") . "\n";
                file_put_contents($logFile, $logEntry, FILE_APPEND);

                // Prepare the response
                $response = array(
                    "status" => "success",
                    "message" => "Successfully Logged In",
                    "personal_info" => array(
                        "id" => $row['id'],
                        "fname" => $row['fname'],
                        "lname" => $row['lname'],
                        "email" => $row['email'],
                        "en_no" => $row['en_no'],
                        "dob" => $row['dob'],
                        "gender" => $row['gender']
                    ),
                    "contact_info" => array(
                        "mo_no" => $row['mo_no'],
                        "department" => $row['department'],
                        "uni_email" => $row['uni_email'],
                        "abc_id" => $row['abc_id'],
                        "add1" => $row['add1'],
                        "add2" => $row['add2'],
                        "github" => $row['github'],
                        "linkedin" => $row['linkedin']
                    ),
                    "documents" => array(
                        "passport_img" => $row['passport_img'],
                        "aadhaar_card" => $row['aadhaar_card'],
                        "pre_academic" => $row['pre_academic'],
                        "resume" => $row['resume'],
                        "portfolio" => $row['portfolio']
                    )
                );
            } else {
                $response = array("status" => "error", "message" => "User data not found");
            }
        } else {
            $response = array("status" => "error", "message" => "Wrong Password");
        }
    } else {
        $response = array("status" => "error", "message" => "User not found, Please First Register");
    }

    echo json_encode($response);
    $conn->close();
}
 elseif ($requestMethod === 'DELETE') {
    $userId = $_GET['id'];
    // Handle DELETE request: Delete the user from all three tables

    // Delete from 'personal_info'
    $sql = "DELETE FROM personal_info WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();

    // Delete from 'contact_info'
    $sql = "DELETE FROM contact_info WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();

    // Delete from 'documents'
    $sql = "DELETE FROM documents WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();

    // Delete the user's folder
    $folder = "../upload_document/" . $userId;
    if (is_dir($folder)) {
        $files = glob($folder . "/*");
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        rmdir($folder);
    }

    // Write log
    $logFile = '../form_data_log.txt';
    $logEntry = "User with ID " . $userId . " has been deleted on " . date("Y-m-d H:i:s") . "\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);

    // Check if any row was affected
    if ($stmt->affected_rows > 0) {
        $response = array("status" => "success", "message" => "User profile deleted successfully");
    } else {
        $response = array("status" => "error", "message" => "Failed to delete user profile");
    }

    echo json_encode($response);
    $conn->close();
    exit;
} elseif ($requestMethod === 'PUT') {
    $userId = isset($_GET['id']) ? $_GET['id'] : '';

    // Personal Information
    $fname = $_POST['fname'] ?? '';
    $lname = $_POST['lname'] ?? '';
    $email = $_POST['email'] ?? '';
    $en_no = $_POST['en_no'] ?? '';
    $dob = $_POST['dob'] ?? '';
    $gender = $_POST['gender'] ?? '';

    // Contact Information
    $mo_no = $_POST['mo_no'] ?? '';
    $department = $_POST['department'] ?? '';
    $uni_email = $_POST['uni_email'] ?? '';
    $abc_id = $_POST['abc'] ?? '';
    $add1 = $_POST['add1'] ?? '';
    $add2 = $_POST['add2'] ?? '';
    $github = $_POST['github'] ?? '';
    $linkedin = $_POST['linkedin'] ?? '';

    // File Upload Directory
    $uploadDir = "../upload_document/$userId/";

    // Upload Files
    $passport_img = uploadFile('passport_img', 'passport_img', $uploadDir);
    $aadhaar_card = uploadFile('aadhaar_card', 'aadhaar_card', $uploadDir);
    $pre_academic = uploadFile('pre_academic', 'pre_academic', $uploadDir);
    $resume = uploadFile('resume', 'resume', $uploadDir);
    $portfolio = uploadFile('portfolio', 'portfolio', $uploadDir);

    // Log file location
    $logFile = '../form_data_log.txt';

    // Update personal_info table
    $sql1 = "UPDATE personal_info SET fname = ?, lname = ?, email = ?, en_no = ?, dob = ?, gender = ? WHERE id = ?";
    $stmt1 = $conn->prepare($sql1);
    $stmt1->bind_param("ssssssi", $fname, $lname, $email, $en_no, $dob, $gender, $userId);

    if ($stmt1->execute()) {
        // Log success for personal_info update
        file_put_contents($logFile, "[$userId] Personal info updated successfully: fname=$fname, lname=$lname, email=$email\n", FILE_APPEND);

        // Update contact_info table
        $sql2 = "UPDATE contact_info SET mo_no = ?, department = ?, uni_email = ?, abc_id = ?, add1 = ?, add2 = ?, github = ?, linkedin = ? WHERE id = ?";
        $stmt2 = $conn->prepare($sql2);
        $stmt2->bind_param("isssssssi", $mo_no, $department, $uni_email, $abc_id, $add1, $add2, $github, $linkedin, $userId);

        if ($stmt2->execute()) {
            // Log success for contact_info update
            file_put_contents($logFile, "[$userId] Contact info updated successfully: mo_no=$mo_no, department=$department\n", FILE_APPEND);

            // Update documents table
            $sql3 = "UPDATE documents SET passport_img = ?, aadhaar_card = ?, pre_academic = ?, resume = ?, portfolio = ? WHERE id = ?";
            $stmt3 = $conn->prepare($sql3);
            $stmt3->bind_param("sssssi", $passport_img, $aadhaar_card, $pre_academic, $resume, $portfolio, $userId);

            if ($stmt3->execute()) {
                // Log success for documents update
                file_put_contents($logFile, "[$userId] Documents updated successfully: passport_img=$passport_img, aadhaar_card=$aadhaar_card\n", FILE_APPEND);
                echo json_encode(['status' => 'success', 'message' => 'Profile and documents updated successfully!']);
            } else {
                file_put_contents($logFile, "[$userId] Error updating documents.\n", FILE_APPEND);
                echo json_encode(['status' => 'error', 'message' => 'Error updating document information.']);
            }
            $stmt3->close();
        } else {
            file_put_contents($logFile, "[$userId] Error updating contact information.\n", FILE_APPEND);
            echo json_encode(['status' => 'error', 'message' => 'Error updating contact information.']);
        }
        $stmt2->close();
    } else {
        file_put_contents($logFile, "[$userId] Error updating personal information.\n", FILE_APPEND);
        echo json_encode(['status' => 'error', 'message' => 'Error updating personal information.']);
    }
    $stmt1->close();
} elseif ($requestMethod === 'GET') {
    $userId = $_GET['id'] ?? '';

    // Fetch data from personal_info, contact_info, and documents
    $sql = "SELECT p.*, c.*, d.* FROM personal_info p
            JOIN contact_info c ON p.id = c.id
            JOIN documents d ON p.id = d.id
            WHERE p.id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $data = $result->fetch_assoc();
        echo json_encode($data);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'User not found.']);
    }
    $stmt->close();
} else {
    // Default response for unsupported request methods
    $response = array("status" => "error", "message" => "Invalid request method");
    echo json_encode($response);
    $conn->close();
}

?>