# File Upload and Sorting Web Application

This project implements a web application that allows users to upload `.txt` or `.csv` files, which are then processed by an AWS Lambda function to sort the data. The sorted file is then made available for download from an S3 output bucket.

## Project Overview

This application leverages AWS services like S3 and Lambda for file management and data processing. Users can upload a file, track the progress of the upload and sorting process, and download the sorted file once processing is complete.

### Key Features

- **File Upload:** Allows users to upload `.txt` or `.csv` files through the web interface.
- **Data Sorting:** The file is sorted based on certain criteria using an AWS Lambda function.
- **Progress Tracking:** Displays the upload and sorting progress in real-time.
- **Download Sorted File:** Once the file is processed, the user can download the sorted file.
- **File Validation:** Only `.txt` and `.csv` files are allowed for upload to ensure compatibility with the sorting process.

### Technologies Used

- **Frontend:**
  - HTML
  - CSS (External styles via `styles.css`)
  - JavaScript (AWS SDK for file handling and Lambda invocation)
- **Backend:**
  - **AWS S3:** For storing uploaded and sorted files.
  - **AWS Lambda:** For processing and sorting the uploaded file.
  - **AWS Cognito Identity Pool:** For authenticating and authorizing file uploads.

### AWS Services

- **AWS S3 Buckets:** 
  - `sort-in-bucket`: Stores the uploaded files.
  - `sort-out-bucket`: Stores the processed and sorted files.

    ![S3 Buckets Configuration](./screenshots/s3-buckets-configuration.png)

- **AWS Lambda Function:** `file-sorting-function` sorts the file and places it in the `sort-out-bucket`.

    ![Lambda Function Creation](./screenshots/lambda-function-creation.png)

- **AWS Cognito:** For authenticating the client app with AWS resources.

    ![Cognito Setup](./screenshots/cognito-setup.png)

## Setup Instructions

To set up and run this project locally, follow these steps:

### 1. Clone the Repository
Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
2. Install Dependencies
The project uses AWS SDK for JavaScript. To manage environment variables, you can use dotenv:

bash
Copy code
npm install dotenv
3. Configure Environment Variables
Create a .env file at the root of your project directory to configure AWS credentials and region.

bash
Copy code
AWS_REGION=us-east-2
IDENTITY_POOL_ID=us-east-2:1a114e8d-32ad-4054-a1ea-0d13f3d0f289
4. Set Up AWS Services
Create AWS S3 Buckets:

sort-in-bucket (for uploading files)
sort-out-bucket (for storing processed files)

Create AWS Lambda Function:

Create a Lambda function (file-sorting-function) that sorts the file and places it in the sort-out-bucket.

Create IAM Roles:

Create IAM roles for AWS Lambda and AWS S3 to allow appropriate permissions for file processing.

Set Up AWS Cognito:

Set up a Cognito Identity Pool for authenticating users with the AWS services.

5. Run the Application
You can run the project by opening the index.html file in a browser. If you're using a local server, serve the file through it. The app will interact with the AWS services to allow file uploads, sorting, and downloads.

6. Push to GitHub
Once everything is set up, push the repository to GitHub.

bash
Copy code
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repository-name.git
git push -u origin master
Project Structure
bash
Copy code
/project-root
  /index.html             # Main HTML page for file upload and interaction
  /app.js                 # JavaScript file containing app logic
  /styles.css             # Styling for the application
  /.env                   # Environment variables for AWS credentials
  /README.md              # Documentation for the project
  /screenshots            # Folder containing all project-related screenshots
Detailed Workflow
User Uploads a File: The user selects a .txt or .csv file for upload. The file is validated to ensure it matches the required format. Once selected, the upload button becomes enabled, and the file is uploaded to the sort-in-bucket in AWS S3.


File Sorting Process: Upon successful upload, an AWS Lambda function (file-sorting-function) is triggered. This function processes the file and sorts its data. The sorted data is then stored in the sort-out-bucket.


Progress Display: During the upload and processing steps, the user is shown a progress bar indicating the status of the upload and the sorting process.


File Download: Once the file is sorted, the user can download the processed file by clicking the download button. The sorted file is made available via a signed URL from AWS S3, allowing secure download access.