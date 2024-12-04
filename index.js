import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const CHATBASE_API_KEY = process.env.CHATBASE_API_KEY;
const CHATBOT_ID = process.env.CHATBOT_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

// Fetch conversations from Chatbase (example)
async function fetchConversations(startDate, endDate, filteredSources, page = 1, size = 10) {
  const queryParams = new URLSearchParams({
    chatbotId: CHATBOT_ID,
    startDate,
    endDate,
    filteredSources,
    page: page.toString(),
    size: size.toString(),
  }).toString();

  const url = `https://www.chatbase.co/api/v1/get-conversations?${queryParams}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHATBASE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Chatbase API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

// Send data to Airtable (example)
async function sendDataToAirtable(data) {
  const airtableBaseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
  const airtableData = {
    fields: {
      email: data.email,
      Environmental_Why: data.environmentalWhy,
      What_I_Bring: data.whatIBring,
      What_Motivates_Me: data.whatMotivatesMe,
      What_Earth_Needs: data.whatEarthNeeds,
    },
  };

  try {
    const response = await fetch(airtableBaseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableData),
    });

    if (!response.ok) {
      throw new Error(`Airtable API Error: ${response.statusText}`);
    }

    console.log('Data successfully sent to Airtable');
  } catch (error) {
    console.error('Error sending data to Airtable:', error);
    throw error;
  }
}

// Endpoint for Airtable Integration
app.post('/', async (req, res) => {
  const data = req.body;

  if (!data.email || !data.environmentalWhy || !data.whatIBring || !data.whatMotivatesMe || !data.whatEarthNeeds) {
    return res.status(400).send('Missing required fields in request body.');
  }

  try {
    await sendDataToAirtable(data);
    res.status(200).send('Data successfully sent to Airtable.');
  } catch (error) {
    res.status(500).send('Failed to process the request.');
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
