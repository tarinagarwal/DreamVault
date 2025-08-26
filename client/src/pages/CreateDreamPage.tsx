import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Music,
  Image,
  Sparkles,
  ArrowLeft,
  Wand2,
} from "lucide-react";
import { dreamsAPI, CreateDreamRequest } from "../api/dreams";
import LoadingSpinner from "../components/LoadingSpinner";

const CreateDreamPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    generateStory: false,
    generateMusic: false,
    generateComic: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      setIsLoading(false);
      return;
    }

    if (
      !formData.generateStory &&
      !formData.generateMusic &&
      !formData.generateComic
    ) {
      setError("Please select at least one generation option");
      setIsLoading(false);
      return;
    }

    try {
      const response = await dreamsAPI.createDream(
        formData as CreateDreamRequest
      );
      if (response.success) {
        navigate("/dreams");
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create dream");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="theme-page p-3">
      <div className="theme-container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dreams")}
              className="theme-btn-ghost bg-neutral-800 border border-neutral-700 mb-4 inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dreams
            </button>
            <div className="text-center">
              <div className="w-16 h-16 theme-bg-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold theme-text-primary mb-2">
                Create Your Dream
              </h1>
              <p className="theme-text-secondary">
                Describe your dream, thought, or idea and watch it come to life
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="theme-card">
            <div className="theme-card-body">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="theme-alert-error">{error}</div>}

                {/* Title */}
                <div>
                  <label htmlFor="title" className="theme-label">
                    Dream Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="theme-input"
                    placeholder="Give your dream a catchy title..."
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="theme-label">
                    Dream Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={6}
                    className="theme-input resize-none"
                    placeholder="Describe your dream in detail... The more vivid, the better! For example: 'I was running on a rainbow made of glass, chased by a giant cat with laser eyes...'"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  <p className="theme-help">
                    Be as creative and detailed as possible. Include colors,
                    emotions, characters, and settings.
                  </p>
                </div>

                {/* Generation Options */}
                <div>
                  <label className="theme-label mb-4 block">
                    What would you like to generate?
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Story Option */}
                    <label className="theme-card cursor-pointer hover:shadow-medium transition-all duration-200">
                      <div className="theme-card-body text-center">
                        <input
                          type="checkbox"
                          name="generateStory"
                          checked={formData.generateStory}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
                            formData.generateStory
                              ? "theme-bg-gradient text-white"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold theme-text-primary mb-2">
                          Story Book
                        </h3>
                        <p className="text-sm theme-text-secondary">
                          Transform into an engaging narrative
                        </p>
                        <div
                          className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                            formData.generateStory
                              ? "bg-brand-100 text-brand-700"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {formData.generateStory ? "Selected" : "Available"}
                        </div>
                      </div>
                    </label>

                    {/* Music Option */}
                    <label className="theme-card cursor-pointer hover:shadow-medium transition-all duration-200">
                      <div className="theme-card-body text-center">
                        <input
                          type="checkbox"
                          name="generateMusic"
                          checked={formData.generateMusic}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
                            formData.generateMusic
                              ? "theme-bg-gradient text-white"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          <Music className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold theme-text-primary mb-2">
                          Theme Song
                        </h3>
                        <p className="text-sm theme-text-secondary">
                          Create atmospheric music
                        </p>
                        <div
                          className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                            formData.generateMusic
                              ? "bg-brand-100 text-brand-700"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {formData.generateMusic ? "Selected" : "Available"}
                        </div>
                      </div>
                    </label>

                    {/* Comic Option */}
                    <label className="theme-card cursor-pointer hover:shadow-medium transition-all duration-200">
                      <div className="theme-card-body text-center">
                        <input
                          type="checkbox"
                          name="generateComic"
                          checked={formData.generateComic}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ${
                            formData.generateComic
                              ? "theme-bg-gradient text-white"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          <Image className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold theme-text-primary mb-2">
                          Comic Strip
                        </h3>
                        <p className="text-sm theme-text-secondary">
                          6-panel manga-style comic
                        </p>
                        <div
                          className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                            formData.generateComic
                              ? "bg-brand-100 text-brand-700"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {formData.generateComic ? "Selected" : "Available"}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-neutral-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full theme-btn-primary py-4 text-lg group"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                        Transform My Dream
                      </>
                    )}
                  </button>
                  <p className="text-center theme-text-muted text-sm mt-3">
                    Generation may take a few minutes
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDreamPage;
