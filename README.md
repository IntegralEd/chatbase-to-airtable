# chatbase-to-airtable

ChatBase-to-Airtable Bridge
This repository contains the implementation of a serverless bridge between ChatBase and Airtable using Node.js and Google Cloud Functions. The bridge fetches conversations from ChatBase and records specific details in Airtable, enabling streamlined data tracking and integration.

Features
ChatBase Integration:

Retrieves chatbot conversations using the ChatBase API.
Supports filters like chatbot ID, date range, and sources.
Airtable Integration:

Logs conversation data into Airtable.
Customizable table and field mapping.
Environment-Driven Configuration:

Uses environment variables for sensitive data like API keys and table IDs.
Serverless Deployment:

Runs as a Google Cloud Function with HTTP triggers.
Scalable and cost-effective solution.
Requirements
Technologies
Node.js: Runtime for the application.
Google Cloud Functions: Deployment platform.
Airtable API: Data storage.
ChatBase API: Conversation source.
Environment Variables
To ensure secure and modular deployments, the following environment variables are required:

Variable	Description
CHATBASE_API_KEY	API key for authenticating with ChatBase
CHATBOT_ID	ID of the ChatBase bot
AIRTABLE_API_KEY	API key for Airtable
AIRTABLE_BASE_ID	Airtable base ID
AIRTABLE_TABLE_NAME	Airtable table name
PORT	Port for local testing (default: 8080)
Setup
Clone Repository:

bash
Copy code
git clone https://github.com/your-username/chatbase-to-airtable.git
cd chatbase-to-airtable
Install Dependencies:

bash
Copy code
npm install
Create .env File: Add your environment variables to a .env file (excluded from Git):

env
Copy code
CHATBASE_API_KEY=your_chatbase_api_key
CHATBOT_ID=your_chatbot_id
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_NAME=your_airtable_table_name
PORT=8080
Run Locally:

bash
Copy code
node index.js
Deployment
Install Google Cloud CLI: Follow the Google Cloud CLI setup guide.

Deploy to Google Cloud Functions: Use the following command to deploy the function:

bash
Copy code
gcloud functions deploy chatbaseToAirtable \
--runtime nodejs18 \
--trigger-http \
--allow-unauthenticated \
--set-env-vars CHATBASE_API_KEY="your_chatbase_api_key",CHATBOT_ID="your_chatbot_id",AIRTABLE_API_KEY="your_airtable_api_key",AIRTABLE_BASE_ID="your_airtable_base_id",AIRTABLE_TABLE_NAME="your_airtable_table_name"
Monitor Logs: View deployment logs for debugging:

bash
Copy code
gcloud functions logs read chatbaseToAirtable
Usage
The bridge listens for POST requests.
Incoming payloads should include conversation details formatted according to the Airtable schema.
Example Request:

json
Copy code
{
  "email": "user@example.com",
  "environmentalWhy": "I care about sustainability.",
  "whatIBring": "Expertise in renewable energy.",
  "whatMotivatesMe": "Making a positive impact.",
  "whatEarthNeeds": "More advocates for clean energy."
}
Response:

200 OK: Data successfully logged in Airtable.
400 Bad Request: Missing required fields.
500 Internal Server Error: Processing failure.
Contributing
Fork Repository.
Create Feature Branch: git checkout -b feature-name.
Commit Changes: git commit -m 'Description of changes'.
Push to Branch: git push origin feature-name.
Open Pull Request.
License
This project is licensed under the MIT License. See LICENSE for more details.

References
ChatBase API Documentation
Airtable API Documentation
Google Cloud Functions Documentation
