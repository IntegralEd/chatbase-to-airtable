import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(express.json());

// Route to receive data from Chatbase
app.post('/', async (req, res) => {
  const data = req.body;

  // Basic validation for required fields
  if (!data.email) {
    return res.status(400).send('Missing required fields');
  }

  // Airtable setup
  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const airtableBaseId = process.env.AIRTABLE_BASE_ID;
  const airtableTableName = process.env.AIRTABLE_TABLE_NAME;

  const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`;
  const airtableData = {
    fields: {
      email: data.email,
      environmentalWhy: data.environmentalWhy,
      whatIBring: data.whatIBring,
      whatMotivatesMe: data.whatMotivatesMe,
      whatEarthNeeds: data.whatEarthNeeds,
    },
  };

  try {
    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableData),
    });

    if (!response.ok) {
      console.error('Failed to send data to Airtable');
      return res.status(500).send('Failed to send data to Airtable');
    }

    res.status(200).send('Data successfully sent to Airtable');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
