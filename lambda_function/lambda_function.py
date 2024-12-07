import json
import boto3

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Define your bucket names
    input_bucket = 'sort-in-bucket'
    output_bucket = 'sort-out-bucket'
    
    # If the event comes from an S3 trigger (uploaded file), process it
    if 'Records' in event:
        try:
            # Get the file details from the S3 event
            file_key = event['Records'][0]['s3']['object']['key']
            
            # Check if the file is under the 'unsorted/' folder in the input bucket
            if not file_key.startswith('unsorted/'):
                raise Exception('File is not in the expected "unsorted/" folder.')

            # Retrieve the file content from the input bucket
            file_obj = s3.get_object(Bucket=input_bucket, Key=file_key)
            file_content = file_obj['Body'].read().decode('utf-8')
            
            # Split the content by newlines and sort it
            sorted_content = '\n'.join(sorted(file_content.split('\n')))
            
            # Extract the filename (without the folder path)
            file_name = file_key.split('/')[-1]

            # Ensure we replace .txt with .srt
            if file_name.endswith('.txt'):
                output_key = f'sorted-unsorted/sorted-{file_name.replace(".txt", ".srt")}'
            else:
                output_key = f'sorted-unsorted/sorted-{file_name}.srt'  # Fallback in case it's not a .txt file
            
            # Upload the sorted file to the output bucket
            s3.put_object(Bucket=output_bucket, Key=output_key, Body=sorted_content)
            
            # Return a success message
            return {
                'statusCode': 200,
                'body': json.dumps(f'Successfully sorted and uploaded to {output_bucket}/{output_key}')
            }
        
        except Exception as e:
            # Handle any errors that occur during the process
            return {
                'statusCode': 500,
                'body': json.dumps(f'Error processing file {file_key}: {str(e)}')
            }
    
    # If the event is coming from a direct invocation (e.g., API Gateway or other sources)
    elif 'key' in event:
        try:
            file_key = event['key']
            
            # Check if the file is under the 'unsorted/' folder in the input bucket
            if not file_key.startswith('unsorted/'):
                raise Exception('File is not in the expected "unsorted/" folder.')

            # Retrieve the file content from the input bucket
            file_obj = s3.get_object(Bucket=input_bucket, Key=file_key)
            file_content = file_obj['Body'].read().decode('utf-8')
            
            # Split the content by newlines and sort it
            sorted_content = '\n'.join(sorted(file_content.split('\n')))
            
            # Extract the filename (without the folder path)
            file_name = file_key.split('/')[-1]

            # Ensure we replace .txt with .srt
            if file_name.endswith('.txt'):
                output_key = f'sorted-unsorted/sorted-{file_name.replace(".txt", ".srt")}'
            else:
                output_key = f'sorted-unsorted/sorted-{file_name}.srt'  # Fallback in case it's not a .txt file
            
            # Upload the sorted file to the output bucket
            s3.put_object(Bucket=output_bucket, Key=output_key, Body=sorted_content)
            
            # Return a success message
            return {
                'statusCode': 200,
                'body': json.dumps(f'Successfully sorted and uploaded to {output_bucket}/{output_key}')
            }
        
        except Exception as e:
            # Handle any errors that occur during the process
            return {
                'statusCode': 500,
                'body': json.dumps(f'Error processing file {file_key}: {str(e)}')
            }
    else:
        return {
            'statusCode': 400,
            'body': json.dumps('Bad Request: Missing file key')
        }
