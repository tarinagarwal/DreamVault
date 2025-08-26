const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Language mapping for better translation context
const LANGUAGE_NAMES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  hi: "Hindi",
};

export const translateText = async (
  text,
  targetLanguage,
  sourceLanguage = "auto"
) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error("Translation service not configured");
    }

    // Return original text if target is English
    if (targetLanguage === "en") {
      return {
        translatedText: text,
        sourceLanguage: sourceLanguage === "auto" ? "en" : sourceLanguage,
        targetLanguage,
        confidence: 1.0,
      };
    }

    const targetLanguageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    const sourceLanguageName =
      sourceLanguage !== "auto"
        ? LANGUAGE_NAMES[sourceLanguage]
        : "the source language";

    const prompt = `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. 
Maintain the original tone, style, and meaning. If it's a story or creative content, preserve the narrative flow and emotional impact.

Text to translate:
${text}

Translation:`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are a professional translator specializing in creative and literary content. 
            Provide accurate translations that preserve the original meaning, tone, and style. 
            For stories and creative content, maintain the narrative flow and emotional impact.
            Only return the translated text, nothing else.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.3, // Lower temperature for more consistent translations
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();

    return {
      translatedText,
      sourceLanguage: sourceLanguage === "auto" ? "en" : sourceLanguage,
      targetLanguage,
      confidence: 0.9, // High confidence for AI translation
    };
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text");
  }
};

export const translateStory = async (story, targetLanguage) => {
  try {
    if (targetLanguage === "en") {
      return story;
    }

    // Translate title, content, and genre
    const [titleResult, contentResult, genreResult] = await Promise.all([
      translateText(story.title, targetLanguage),
      translateText(story.content, targetLanguage),
      translateText(story.genre, targetLanguage),
    ]);

    return {
      title: titleResult.translatedText,
      content: contentResult.translatedText,
      genre: genreResult.translatedText,
    };
  } catch (error) {
    console.error("Story translation error:", error);
    throw error;
  }
};
