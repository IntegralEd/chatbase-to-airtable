import fetch from 'node-fetch';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Parse raw body
app.use(bodyParser.json()); // Switch to simple JSON parsing for simplicity

const CHATBASE_API_KEY = process.env.CHATBASE_API_KEY;
const CHATBOT_ID = process.env.CHATBOT_ID; // Chatbot ID set via environment variable

async function fetchConversations(startDate, endDate, filteredSources, page = 1, size = 10) {
  const queryParams = new URLSearchParams({
    chatbotId: CHATBOT_ID,
    startDate,
    endDate,
    filteredSources,
    page: page.toString(),
    size: size.toString(),
  }).toString();

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
      throw new Error('Failed to fetch conversations');
    }

    const data = await response.json();
    console.log('Conversations:', data);

    // Check if there are more pages of results
    if (data.data && data.data.length === size) {
      const nextPageData = await fetchConversations(startDate, endDate, filteredSources, page + 1, size);
      return data.data.concat(nextPageData);
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

app.post('/', async (req, res) => {
  const data = req.body;
  
  // Basic input validation
  if (!data.email || !data.environmentalWhy || !data.whatIBring || !data.whatMotivatesMe || !data.whatEarthNeeds) {
    console.error('Missing fields in request:', data);
    return res.status(400).send('Missing required fields in request body.');
  }

  console.log('Request received:', data);

  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const airtableBaseId = process.env.AIRTABLE_BASE_ID;
  const airtableTableName = process.env.AIRTABLE_TABLE_NAME;

  if (!airtableApiKey || !airtableBaseId || !airtableTableName) {
    console.error("Missing Airtable configuration");
    return res.status(500).send("Server misconfiguration");
  }

  const airtableBaseUrl = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`;
  const airtableData = {
    fields: {
      email: data.email,
      Environmental_Why: data.environmentalWhy,
      What_I_Bring: data.whatIBring,
      What_Motivates_Me: data.whatMotivatesMe,
      What_Earth_Needs: data.whatEarthNeeds,
    },
  };

  console.log('Airtable Data Being Sent:', airtableData);

  try {
    const response = await fetch(airtableBaseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableData),
    });

    if (!response.ok) {
      console.error(`Failed to send data to Airtable: ${response.statusText}`);
      throw new Error('Failed to send data to Airtable');
    }

    console.log('Data successfully sent to Airtable');
    res.status(200).send('Data successfully sent to Airtable.');
  } catch (error) {
    console.error('Error sending data to Airtable:', error);
    res.status(500).send('Failed to process the request.');
  }
});

// Export for Cloud Functions
export const chatbaseToAirtable = app;
