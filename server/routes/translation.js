import express from "express";
import { translateText, translateStory } from "../utils/translationService.js";

const router = express.Router();

// Translate text
router.post("/translate", async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = "auto" } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Text and target language are required",
      });
    }

    const result = await translateText(text, targetLanguage, sourceLanguage);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Translation route error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Translation failed",
    });
  }
});

// Translate story
router.post("/translate-story", async (req, res) => {
  try {
    const { story, targetLanguage } = req.body;

    if (!story || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Story and target language are required",
      });
    }

    const translatedStory = await translateStory(story, targetLanguage);

    res.json({
      success: true,
      story: translatedStory,
    });
  } catch (error) {
    console.error("Story translation route error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Story translation failed",
    });
  }
});

export default router;
