// Configure AWS SDK with region and Cognito Identity Pool
AWS.config.region = 'us-east-2'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-2:1a114e8d-32ad-4054-a1ea-0d13f3d0f289', 
});

const s3 = new AWS.S3();
const lambda = new AWS.Lambda();

const uploadFileButton = document.getElementById('upload-file-button');
const fileInput = document.getElementById('file-input');
const statusMessage = document.getElementById('status-message');
const fileNameDisplay = document.getElementById('file-name-display');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressContainer = document.getElementById('progress-container');
const downloadButton = document.getElementById('download-file-button');

// Hide progress and status elements initially
statusMessage.style.display = 'none';
progressContainer.style.display = 'none';
progressText.style.display = 'none';
downloadButton.style.display = 'none'; 

// Enable the upload button when a file is selected and display the file name
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    fileNameDisplay.textContent = `Selected File: ${file.name}`;
    uploadFileButton.disabled = false;
    statusMessage.textContent = ''; 
  } else {
    fileNameDisplay.textContent = '';
    uploadFileButton.disabled = true;
    statusMessage.textContent = 'No file uploading'; 
  }
});

// Event listener for the upload button
uploadFileButton.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a file to upload');
    return;
  }

  const fileKey = `unsorted/${file.name}`;

  // Check if the file is either a .txt or .csv file
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (fileExtension !== 'txt' && fileExtension !== 'csv') {
    alert('Please upload a .txt or .csv file only');
    return;
  }

  // Read and display the unsorted file content
  const reader = new FileReader();
  reader.onload = function (event) {
    const unsortedData = event.target.result.split('\n').map(row => row.split(','));
    populateTable('unsorted-table', unsortedData);
  };
  reader.readAsText(file);

  // Show "Uploading" text with progress 0%
  statusMessage.style.display = 'block'; // Show status message
  progressContainer.style.display = 'block'; // Show progress bar container
  progressText.style.display = 'block'; // Show progress text
  statusMessage.textContent = 'Uploading and Sorting File';
  progressBar.style.width = '0%'; // Reset progress bar to 0%

  try {
    // Upload file to S3
    const params = {
      Bucket: 'sort-in-bucket', // Input bucket name
      Key: fileKey,
      Body: file,
      ContentType: file.type,
    };

    // Update progress bar and text during upload
    await s3.upload(params)
      .on('httpUploadProgress', function (progress) {
        if (progress.loaded && progress.total) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          progressBar.style.width = percent + '%'; // Update progress bar width
          progressText.textContent = `Uploading... ${percent}%`; // Update progress text
        }
      })
      .promise();

    console.log('File uploaded successfully.');

    // Invoke the Lambda function to sort the file
    const lambdaParams = {
      FunctionName: 'file-sorting-function', // Lambda function name
      Payload: JSON.stringify({
        Records: [
          {
            s3: {
              bucket: { name: 'sort-in-bucket' },
              object: { key: fileKey },
            },
          },
        ],
      }),
    };
    await lambda.invoke(lambdaParams).promise();
    console.log('Lambda function invoked.');

    // Check for sorted file after a delay
    setTimeout(checkSortedFile, 5000);
  } catch (error) {
    console.error('Error:', error);
    statusMessage.textContent = 'Error uploading or sorting the file.';
  }
});

// Function to check for the sorted file in S3
async function checkSortedFile() {
    const outputFileName = `sorted-unsorted/sorted-${fileInput.files[0].name.replace('.txt', '.srt')}`;

  //const outputFileName = `sorted-unsorted/sorted-${fileInput.files[0].name}`;
  const params = {
    Bucket: 'sort-out-bucket', // Output bucket name
    Key: outputFileName,
  };

  try {
    const result = await s3.getObject(params).promise();
    const sortedData = result.Body.toString('utf-8').split('\n').map(row => row.split(','));
    populateTable('sorted-table', sortedData);
    statusMessage.textContent = 'File sorted successfully!';
    setTimeout(() => {
      // Hide progress bar and status message after 2 seconds
      progressContainer.style.display = 'none';
      progressText.style.display = 'none';
      statusMessage.style.display = 'none'; // Hide status message
      uploadFileButton.textContent = 'Uploaded';  // Change button text to "Uploaded"
      uploadFileButton.disabled = true;  // Disable button after upload completion
    }, 2000);

    // Show the download button for the sorted file
    downloadButton.style.display = 'block';
    downloadButton.disabled = false; // Enable the download button
    downloadButton.onclick = function(event) {
        event.preventDefault();

      // Create a download link for the sorted file
      const downloadUrl = s3.getSignedUrl('getObject', {
        Bucket: 'sort-out-bucket',
        Key: outputFileName,
        Expires: 60, // URL expiration time in seconds
      });
      
      // Create an invisible link to trigger download without page refresh
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `sorted-${fileInput.files[0].name}`;  // Set the name for the downloaded file
      a.style.display = 'none';
      document.body.appendChild(a); // Append link to body
      a.click();  // Trigger click to download the file
      document.body.removeChild(a);  // Clean up by removing the link
    };
  } catch (error) {
    console.error('Error retrieving sorted file:', error);
    statusMessage.textContent = 'Could not retrieve sorted file.';
  }
}

// Function to populate a table with data
function populateTable(tableId, data) {
  const tableBody = document.getElementById(tableId).querySelector('tbody');
  tableBody.innerHTML = ''; // Clear existing content

  // Filter out empty rows
  const filteredData = data.filter(rowData => rowData.some(cellData => cellData.trim() !== ''));

  filteredData.forEach(rowData => {
    const row = document.createElement('tr');

    rowData.forEach(cellData => {
      const cell = document.createElement('td');
      cell.textContent = cellData;
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
}
