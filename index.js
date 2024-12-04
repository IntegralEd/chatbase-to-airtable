import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();

// Parse raw body
app.use(bodyParser.json());

const CHATBASE_API_KEY = process.env.CHATBASE_API_KEY;
const CHATBOT_ID = process.env.CHATBOT_ID;

// Endpoint for Airtable Integration
app.post('/', async (req, res) => {
  const data = req.body;

  // Input validation
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
        Authorization: `Bearer ${airtableApiKey}`, // Ensure this is correct and updated to use PAT
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send data to Airtable: ${errorText}`);
      throw new Error('Failed to send data to Airtable');
    }

    console.log('Data successfully sent to Airtable');
    res.status(200).send('Data successfully sent to Airtable.');
  } catch (error) {
    console.error('Error sending data to Airtable:', error);
    res.status(500).send('Failed to process the request.');
  }
});

// Listener for Google App Engine
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export for Cloud Functions (if needed)
export default app;
