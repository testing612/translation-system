require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Translation endpoint
app.post('/translate', async (req, res) => {
  try {
    const { originalText, targetLanguage } = req.body;

    // Check cache first
    const { data: existing } = await supabase
      .from('translations')
      .select('translated_text')
      .eq('original_text', originalText)
      .eq('target_language', targetLanguage);

    if (existing?.length > 0) {
      return res.json({ translation: existing[0].translated_text });
    }

    // Get new translation
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Translate this to ${targetLanguage} maintaining hotel industry terminology: ${originalText}`
      }]
    });

    const translatedText = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('translations')
      .insert({ original_text: originalText, target_language: targetLanguage, translated_text: translatedText });

    res.json({ translation: translatedText });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});