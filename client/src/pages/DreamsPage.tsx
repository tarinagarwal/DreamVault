"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Music,
  ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Sparkles,
  Search,
  Filter,
  X,
  Users,
  Activity,
} from "lucide-react";
import { dreamsAPI, type Dream } from "../api/dreams";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import CustomDropdown from "../components/CustomDropdown";

const DreamsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "my" | "public">(
    "all"
  );
  const [contentTypeFilter, setContentTypeFilter] = useState<
    "all" | "story" | "music" | "comic"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "generating" | "failed"
  >("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Dropdown options
  const dreamTypeOptions = [
    { label: "All Dreams", value: "all", description: "Show all dreams" },
    { label: "My Dreams", value: "my", description: "Only my dreams" },
    {
      label: "Public Dreams",
      value: "public",
      description: "Community dreams",
    },
  ];

  const contentTypeOptions = [
    { label: "All Types", value: "all", description: "All content types" },
    { label: "Stories", value: "story", description: "Text-based stories" },
    { label: "Music", value: "music", description: "Generated music" },
    { label: "Comics", value: "comic", description: "Visual comics" },
  ];

  const statusOptions = [
    { label: "All Statuses", value: "all", description: "Any status" },
    { label: "Completed", value: "completed", description: "Ready to view" },
    { label: "Generating", value: "generating", description: "In progress" },
    { label: "Failed", value: "failed", description: "Generation failed" },
  ];

  useEffect(() => {
    fetchDreams();
  }, [isAuthenticated]);

  const fetchDreams = async () => {
    try {
      // Always fetch public dreams to show all available dreams
      // When authenticated, this will include all dreams (user's + others)
      // When not authenticated, this will show only public dreams
      const response = await dreamsAPI.getPublicDreams();

      if (response.success && response.dreams) {
        setDreams(response.dreams);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch dreams");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDreams = useMemo(() => {
    let filtered = dreams;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dream) =>
          dream.title.toLowerCase().includes(query) ||
          dream.description.toLowerCase().includes(query)
      );
    }

    // Apply dream ownership filter
    if (selectedFilter === "my" && isAuthenticated && user) {
      filtered = filtered.filter((dream) => dream.userId === user.id);
    } else if (selectedFilter === "public" && isAuthenticated && user) {
      // Show only dreams that are NOT from the current user
      filtered = filtered.filter((dream) => dream.userId !== user.id);
    }
    // If selectedFilter === "all" or user is not authenticated, show all dreams (no additional filtering)

    // Apply content type filter
    if (contentTypeFilter !== "all") {
      filtered = filtered.filter((dream) => {
        switch (contentTypeFilter) {
          case "story":
            return dream.generateStory;
          case "music":
            return dream.generateMusic;
          case "comic":
            return dream.generateComic;
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((dream) => {
        const statuses = [
          dream.storyStatus,
          dream.musicStatus,
          dream.comicStatus,
        ].filter(Boolean);
        return statuses.some(
          (status) => status.toLowerCase() === statusFilter.toLowerCase()
        );
      });
    }

    return filtered;
  }, [
    dreams,
    searchQuery,
    selectedFilter,
    contentTypeFilter,
    statusFilter,
    isAuthenticated,
    user,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFilter("all");
    setContentTypeFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedFilter !== "all" ||
    contentTypeFilter !== "all" ||
    statusFilter !== "all";

  if (isLoading) {
    return (
      <div className="theme-page min-h-screen">
        <div className="theme-container py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-6">
              <LoadingSpinner size="lg" />
              <div className="space-y-2">
                <p className="text-lg font-medium theme-text-secondary">
                  Loading your dreams...
                </p>
                <p className="text-sm theme-text-muted max-w-sm mx-auto">
                  Preparing your magical content library
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page min-h-screen">
      <div className="theme-container py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 space-y-6 lg:space-y-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold theme-text-primary leading-tight">
                Dream Studio
              </h1>
              <div className="w-16 h-1 theme-bg-gradient rounded-full"></div>
            </div>
            <p className="text-lg sm:text-xl theme-text-secondary max-w-2xl leading-relaxed">
              Transform your dreams into magical stories, music, and comics
            </p>
          </div>
          {isAuthenticated && (
            <div className="flex-shrink-0">
              <Link
                to="/dreams/create"
                className="theme-btn-primary inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Dream
              </Link>
            </div>
          )}
        </div>

        {error && (
          <div className="theme-alert-error mb-8 p-4 rounded-xl border-l-4 border-red-500">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 theme-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search dreams by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl theme-text-primary placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <X className="h-5 w-5 theme-text-muted hover:theme-text-secondary transition-colors" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Dream Type Filter */}
              {isAuthenticated && (
                <CustomDropdown
                  options={dreamTypeOptions}
                  selectedValue={selectedFilter}
                  onValueChange={(value) =>
                    setSelectedFilter(value as "all" | "my" | "public")
                  }
                  placeholder="Select dream type"
                  icon={<Users className="w-4 h-4" />}
                />
              )}

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`inline-flex rounded-xl items-center px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showAdvancedFilters || hasActiveFilters
                    ? "bg-brand-600 border-brand-500 text-white"
                    : "bg-neutral-800 border-neutral-700 theme-text-secondary hover:border-neutral-600"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                    {
                      [
                        searchQuery,
                        selectedFilter !== "all",
                        contentTypeFilter !== "all",
                        statusFilter !== "all",
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm theme-text-muted hover:theme-text-secondary transition-colors bg-neutral-800 border border-neutral-700 px-2 py-2 rounded-xl"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Content Type Filter */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Content Type
                  </label>
                  <CustomDropdown
                    options={contentTypeOptions}
                    selectedValue={contentTypeFilter}
                    onValueChange={(value) =>
                      setContentTypeFilter(
                        value as "all" | "story" | "music" | "comic"
                      )
                    }
                    placeholder="Select content type"
                    icon={<BookOpen className="w-4 h-4" />}
                    className="w-full"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Status
                  </label>
                  <CustomDropdown
                    options={statusOptions}
                    selectedValue={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(
                        value as "all" | "completed" | "generating" | "failed"
                      )
                    }
                    placeholder="Select status"
                    icon={<Activity className="w-4 h-4" />}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          {dreams.length > 0 && (
            <div className="flex items-center justify-between text-sm theme-text-muted">
              <span>
                Showing {filteredDreams.length} of {dreams.length} dreams
                {hasActiveFilters && " (filtered)"}
              </span>
            </div>
          )}
        </div>

        {/* Dreams Content */}
        {filteredDreams.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="max-w-md mx-auto space-y-8">
              <div className="relative">
                <div className="w-32 h-32 theme-bg-gradient rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-400 rounded-full animate-pulse delay-300"></div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-bold theme-text-primary">
                  {hasActiveFilters
                    ? "No Dreams Match Your Search"
                    : isAuthenticated
                    ? "No Dreams Yet"
                    : "No Dreams Available"}
                </h3>
                <p className="theme-text-secondary text-lg leading-relaxed">
                  {hasActiveFilters
                    ? "Try adjusting your search terms or filters to find more dreams."
                    : isAuthenticated
                    ? "Start your creative journey by transforming your first dream into magical content!"
                    : "Be the first to share your dreams with the world!"}
                </p>
              </div>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="theme-btn-secondary inline-flex items-center px-6 py-3 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Clear Filters
                </button>
              ) : (
                isAuthenticated && (
                  <Link
                    to="/dreams/create"
                    className="theme-btn-primary inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="w-6 h-6 mr-3" />
                    Create Your First Dream
                  </Link>
                )
              )}
            </div>
          </div>
        ) : (
          <DreamGrid dreams={filteredDreams} showAuthor={!isAuthenticated} />
        )}
      </div>
    </div>
  );
};

// Dream Grid Component
interface DreamGridProps {
  dreams: Dream[];
  showAuthor: boolean;
}

const DreamGrid: React.FC<DreamGridProps> = ({ dreams, showAuthor }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case "GENERATING":
        return <Loader className="w-4 h-4 text-brand-600 animate-spin" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-danger-600" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Ready";
      case "GENERATING":
        return "Generating...";
      case "FAILED":
        return "Failed";
      default:
        return "Pending";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
      {dreams.map((dream) => (
        <div key={dream.id} className="theme-card group">
          <div className="theme-card-body p-6 lg:p-8 h-full flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-xl lg:text-2xl font-bold theme-text-primary line-clamp-2 leading-tight transition-colors duration-200">
                  {dream.title}
                </h3>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                {dream.generateStory && (
                  <div className="theme-icon-container-primary w-10 h-10 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                    <BookOpen className="w-5 h-5" />
                  </div>
                )}
                {dream.generateMusic && (
                  <div className="theme-icon-container-primary w-10 h-10 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                    <Music className="w-5 h-5" />
                  </div>
                )}
                {dream.generateComic && (
                  <div className="theme-icon-container-primary w-10 h-10 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            <p className="theme-text-secondary mb-8 line-clamp-3 text-base leading-relaxed flex-grow">
              {dream.description}
            </p>

            <div className="space-y-4 mb-8">
              {dream.generateStory && (
                <div className="flex items-center border justify-between p-3 bg-neutral-800 border-neutral-700 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 theme-text-muted" />
                    <span className="font-medium theme-text-secondary">
                      Story
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(dream.storyStatus)}
                    <span className="text-sm font-medium theme-text-secondary">
                      {getStatusText(dream.storyStatus)}
                    </span>
                  </div>
                </div>
              )}

              {dream.generateMusic && (
                <div className="flex items-center justify-between p-3 bg-neutral-800 border-neutral-700 rounded-lg border rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Music className="w-5 h-5 theme-text-muted" />
                    <span className="font-medium theme-text-secondary">
                      Music
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(dream.musicStatus)}
                    <span className="text-sm font-medium theme-text-secondary">
                      {getStatusText(dream.musicStatus)}
                    </span>
                  </div>
                </div>
              )}

              {dream.generateComic && (
                <div className="flex items-center justify-between p-3 bg-neutral-800 border-neutral-700 rounded-xl border">
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="w-5 h-5 theme-text-muted" />
                    <span className="font-medium theme-text-secondary">
                      Comic
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(dream.comicStatus)}
                    <span className="text-sm font-medium theme-text-secondary">
                      {getStatusText(dream.comicStatus)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-600">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium theme-text-muted">
                  {new Date(dream.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Link
                to={`/dreams/${dream.id}`}
                className="theme-btn-secondary px-6 py-2.5 text-sm font-medium rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DreamsPage;
