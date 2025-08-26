"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Type,
  Clock,
  Tag,
  Languages,
} from "lucide-react";
import { dreamsAPI, type Dream } from "../api/dreams";
import LoadingSpinner from "../components/LoadingSpinner";
import { generateStoryPDF } from "../utils/storyPdf";
import LanguageSelector from "../components/LanguageSelector";
import FontSizeSelector from "../components/FontSizeSelector";
import {
  translationService,
  SUPPORTED_LANGUAGES,
} from "../services/translationService";

const StoryViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dream, setDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [fontSize, setFontSize] = useState("text-lg");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translatedStory, setTranslatedStory] = useState<{
    title: string;
    content: string;
    genre: string;
  } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDream(id);
    }
  }, [id]);

  const fetchDream = async (dreamId: string) => {
    try {
      const response = await dreamsAPI.getDream(dreamId);
      if (response.success && response.dream) {
        setDream(response.dream);
      } else {
        setError("Dream not found");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch dream");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === selectedLanguage) return;

    console.log(
      `Changing language from ${selectedLanguage} to ${languageCode}`
    );
    setSelectedLanguage(languageCode);

    if (languageCode === "en") {
      setTranslatedStory(null);
      return;
    }

    if (!dream?.story) return;

    setIsTranslating(true);
    try {
      console.log("Starting translation for story:", dream.story.title);
      const translated = await translationService.translateStory(
        {
          title: dream.story.title,
          content: dream.story.content,
          genre: dream.story.genre || "Fantasy",
        },
        languageCode
      );
      console.log("Translation completed:", translated);
      setTranslatedStory(translated);
    } catch (error) {
      console.error("Translation failed:", error);
      // Reset to English on error
      setSelectedLanguage("en");
      setTranslatedStory(null);
    } finally {
      setIsTranslating(false);
    }
  };

  const getCurrentStory = () => {
    if (!dream?.story) return null;

    if (selectedLanguage === "en" || !translatedStory) {
      return {
        title: dream.story.title,
        content: dream.story.content,
        genre: dream.story.genre || "Fantasy",
      };
    }

    return translatedStory;
  };

  const handleDownloadPDF = () => {
    if (!dream?.story) return;

    const currentStory = getCurrentStory();
    if (!currentStory) return;

    const storyData = {
      title: currentStory.title,
      content: currentStory.content,
      genre: currentStory.genre,
      wordCount: dream.story.wordCount || 0,
      dreamTitle: dream.title,
      dreamDescription: dream.description,
      createdAt: dream.createdAt,
    };

    const selectedLang = SUPPORTED_LANGUAGES.find(
      (lang) => lang.code === selectedLanguage
    );
    const filename = `${currentStory.title.replace(/[^a-zA-Z0-9]/g, "_")}_${
      selectedLang?.name || "English"
    }_story.pdf`;

    generateStoryPDF(storyData, filename);
  };

  if (isLoading) {
    return (
      <div className="theme-page">
        <div className="theme-container px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 theme-text-secondary">Loading story...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dream || !dream.story) {
    return (
      <div className="theme-page">
        <div className="theme-container px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold theme-text-primary mb-2">
              Story Not Available
            </h2>
            <p className="theme-text-secondary mb-6">
              {error || "This story hasn't been generated yet."}
            </p>
            <button
              onClick={() => navigate(`/dreams/${id}`)}
              className="theme-btn-primary"
            >
              Back to Dream
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-sm">
        <div className="theme-container px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden">
            <button
              onClick={() => navigate(`/dreams/${id}`)}
              className="theme-btn-ghost bg-neutral-800 border border-neutral-700 inline-flex items-center px-3 py-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadPDF}
                className="theme-btn-ghost p-2 bg-neutral-800 border border-neutral-700 hover:bg-brand-700 transition-colors"
                title="Download as PDF"
                disabled={isTranslating}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/dreams/${id}`)}
                className="theme-btn-ghost bg-neutral-800 border border-neutral-700 inline-flex items-center px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Language Selector */}
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                disabled={isTranslating}
                className="hidden lg:block"
              />

              {/* Font Size Selector */}
              <FontSizeSelector
                selectedFontSize={fontSize}
                onFontSizeChange={setFontSize}
                className="hidden lg:block"
              />

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadPDF}
                  className="theme-btn-ghost p-2 bg-neutral-800 border border-neutral-700 hover:bg-brand-700 transition-colors"
                  title="Download as PDF"
                  disabled={isTranslating}
                >
                  <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Controls Row */}
          <div className="flex items-center justify-between mt-3 md:hidden space-x-3">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              disabled={isTranslating}
              className="flex-1 min-w-0"
            />

            <FontSizeSelector
              selectedFontSize={fontSize}
              onFontSizeChange={setFontSize}
              className="flex-shrink-0"
            />
          </div>

          {/* Tablet Language Selector */}
          <div className="hidden md:block lg:hidden mt-3">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              disabled={isTranslating}
              className="w-full max-w-xs"
            />
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="theme-container px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Translation Loading */}
          {isTranslating && (
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-3 bg-neutral-800 rounded-xl border border-neutral-700 shadow-sm">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-neutral-300">
                  Translating story...
                </span>
              </div>
            </div>
          )}

          {/* Story Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold theme-text-primary mb-4 sm:mb-6 px-2 sm:px-4 leading-tight">
              {getCurrentStory()?.title || dream.story.title}
            </h1>

            {/* Translation indicator */}
            {selectedLanguage !== "en" && translatedStory && (
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-600 text-white rounded-full text-sm mb-4 sm:mb-6">
                <Languages className="w-4 h-4" />
                <span className="text-xs sm:text-sm">
                  Translated to{" "}
                  {
                    SUPPORTED_LANGUAGES.find(
                      (lang) => lang.code === selectedLanguage
                    )?.nativeName
                  }
                </span>
              </div>
            )}

            {/* Story Metadata Badges */}
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 lg:gap-4 text-sm theme-text-muted mb-6 sm:mb-8 px-2">
              <div className="flex items-center space-x-1 sm:space-x-2 theme-badge-primary py-2 px-2 sm:px-3 text-xs sm:text-sm">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {getCurrentStory()?.genre || dream.story.genre}
                </span>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 theme-badge-primary py-2 px-2 sm:px-3 text-xs sm:text-sm">
                <Type className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {dream.story.wordCount} words
                </span>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 theme-badge-primary py-2 px-2 sm:px-3 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {Math.ceil((dream.story.wordCount || 0) / 200)} min read
                </span>
              </div>

              {/* Always show language badge */}
              <div className="flex items-center space-x-1 sm:space-x-2 theme-badge-primary py-2 px-2 sm:px-3 text-xs sm:text-sm">
                <Languages className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {SUPPORTED_LANGUAGES.find(
                    (lang) => lang.code === selectedLanguage
                  )?.nativeName || "English"}
                </span>
              </div>
            </div>

            <div className="w-16 sm:w-24 h-1 theme-bg-gradient rounded-full mx-auto"></div>
          </div>

          {/* Story Text */}
          <div className="prose prose-lg max-w-none px-2 sm:px-4 lg:px-0">
            <div
              className={`${fontSize} leading-relaxed text-white space-y-4 sm:space-y-6 ${
                selectedLanguage === "ar" ? "text-right" : "text-left"
              }`}
              style={{ lineHeight: "1.8" }}
              dir={selectedLanguage === "ar" ? "rtl" : "ltr"}
            >
              {(getCurrentStory()?.content || dream.story.content)
                .split("\n\n")
                .map((paragraph, index) => (
                  <p key={index} className="mb-4 sm:mb-6">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* Story Footer */}
          <div className="mt-12 sm:mt-16 lg:mt-20 pt-6 sm:pt-8 border-t border-neutral-200 px-2 sm:px-4 lg:px-0">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 theme-bg-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold theme-text-primary mb-4 sm:mb-6">
                The End
              </h3>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => navigate(`/dreams/${id}`)}
                  className="theme-btn-secondary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                >
                  Back to Dream
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewPage;
