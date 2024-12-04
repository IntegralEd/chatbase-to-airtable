import fetch from 'node-fetch'; // Import fetch for making HTTP requests
import express from 'express';   // Import express for creating server
import dotenv from 'dotenv';     // Import dotenv for environment variables

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json()); // Use built-in express JSON parsing

// Environment variables
const { CHATBASE_API_KEY, CHATBOT_ID, AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, PORT = 8080 } = process.env;

// Function to fetch conversations from Chatbase
async function fetchConversations(startDate, endDate, filteredSources, page = 1, size = 10) {
  const queryParams = new URLSearchParams({
    chatbotId: CHATBOT_ID,
    startDate,
    endDate,
    filteredSources,
    page: page.toString(),
    size: size.toString(),
  });

  try {
    const response = await fetch(`https://www.chatbase.co/api/v1/get-conversations?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CHATBASE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch conversations: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.data ?? []; // Return the data if present, otherwise return an empty array

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return []; // Return an empty array on error to prevent further issues
  }
}

// Endpoint for Airtable Integration
app.post('/', async (req, res) => {
  const { email, environmentalWhy, whatIBring, whatMotivatesMe, whatEarthNeeds } = req.body;

  // Input validation
  if (!email || !environmentalWhy || !whatIBring || !whatMotivatesMe || !whatEarthNeeds) {
    console.error('Missing fields in request:', req.body);
    return res.status(400).send('Missing required fields in request body.');
  }

  // Prepare Airtable data
  const airtableData = {
    fields: {
      email,
      Environmental_Why: environmentalWhy,
      What_I_Bring: whatIBring,
      What_Motivates_Me: whatMotivatesMe,
      What_Earth_Needs: whatEarthNeeds,
    },
  };

  try {
    // Send data to Airtable
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableData),
    });

    if (!response.ok) {
      console.error(`Failed to send data to Airtable: ${response.statusText}`);
      return res.status(500).send('Failed to send data to Airtable.');
    }

    console.log('Data successfully sent to Airtable');
    res.status(200).send('Data successfully sent to Airtable.');
  } catch (error) {
    console.error('Error sending data to Airtable:', error);
    res.status(500).send('Failed to process the request.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; // Export app if using Cloud Functions
