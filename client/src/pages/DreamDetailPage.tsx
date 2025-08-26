"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Music,
  ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Play,
  Pause,
  Download,
  Share2,
  Calendar,
  User,
  Sparkles,
  RefreshCwIcon,
} from "lucide-react";
import { dreamsAPI, type Dream } from "../api/dreams";
import LoadingSpinner from "../components/LoadingSpinner";
import { shareStory } from "../utils/storyPdf";

const DreamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dream, setDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [trackStates, setTrackStates] = useState<{
    [trackId: string]: {
      currentTime: number;
      duration: number;
      isLoading: boolean;
    };
  }>({});
  const audioRefs = useRef<{ [trackId: string]: HTMLAudioElement }>({});
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (id) {
      fetchDream(id);
    }
  }, [id]);

  // Set up Server-Sent Events for real-time updates
  useEffect(() => {
    if (!dream || !id) return;

    const hasGenerating =
      dream.storyStatus === "GENERATING" ||
      dream.musicStatus === "GENERATING" ||
      dream.comicStatus === "GENERATING";

    if (hasGenerating && !eventSourceRef.current) {
      console.log("🔄 Connecting to real-time updates for dream:", id);

      const es = dreamsAPI.connectToUpdates(id, (data) => {
        console.log("📡 Received update:", data);

        switch (data.type) {
          case "status":
            // Initial status update
            setDream((prev) =>
              prev
                ? {
                    ...prev,
                    storyStatus: data.data.story as any,
                    musicStatus: data.data.music as any,
                    comicStatus: data.data.comic as any,
                  }
                : null
            );
            break;

          case "storyCompleted":
            setDream((prev) =>
              prev
                ? {
                    ...prev,
                    storyStatus: "COMPLETED",
                    story: data.data.story,
                  }
                : null
            );
            break;

          case "musicCompleted":
            setDream((prev) =>
              prev
                ? {
                    ...prev,
                    musicStatus: "COMPLETED",
                    music: data.data.music,
                  }
                : null
            );
            break;

          case "storyFailed":
            setDream((prev) =>
              prev
                ? {
                    ...prev,
                    storyStatus: "FAILED",
                  }
                : null
            );
            break;

          case "musicFailed":
            setDream((prev) =>
              prev
                ? {
                    ...prev,
                    musicStatus: "FAILED",
                  }
                : null
            );
            break;

          case "comicCompleted":
            setDream((prev) =>
              prev
                ? {
                    ...prev,
                    comicStatus: "COMPLETED",
                    comic: data.data.comic,
                  }
                : null
            );
            break;

          case "comicFailed":
            setDream((prev) =>
              prev
                ? {
                    ...prev,
                    comicStatus: "FAILED",
                  }
                : null
            );
            break;
        }
      });

      eventSourceRef.current = es;

      return () => {
        console.log("🔌 Disconnecting from real-time updates");
        es.close();
        eventSourceRef.current = null;
      };
    }
  }, [dream, id]);

  // Cleanup EventSource and audio elements on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Cleanup all audio elements
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioRefs.current = {};
    };
  }, []);

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

  // Audio control functions
  const togglePlayPause = (trackId: string, audioUrl: string) => {
    const audio = audioRefs.current[trackId];

    if (!audio) {
      // Create new audio element if it doesn't exist
      const newAudio = new Audio(audioUrl);
      audioRefs.current[trackId] = newAudio;

      newAudio.addEventListener("timeupdate", () => handleTimeUpdate(trackId));
      newAudio.addEventListener("loadedmetadata", () =>
        handleLoadedMetadata(trackId)
      );
      newAudio.addEventListener("ended", () => handleEnded(trackId));

      // Initialize track state
      setTrackStates((prev) => ({
        ...prev,
        [trackId]: {
          currentTime: 0,
          duration: 0,
          isLoading: true,
        },
      }));

      newAudio.play();
      setPlayingTrackId(trackId);
      return;
    }

    if (playingTrackId === trackId) {
      // Pause current track
      audio.pause();
      setPlayingTrackId(null);
    } else {
      // Pause any other playing track
      if (playingTrackId && audioRefs.current[playingTrackId]) {
        audioRefs.current[playingTrackId].pause();
      }

      // Play this track
      audio.play();
      setPlayingTrackId(trackId);
    }
  };

  const handleTimeUpdate = (trackId: string) => {
    const audio = audioRefs.current[trackId];
    if (audio) {
      setTrackStates((prev) => ({
        ...prev,
        [trackId]: {
          ...prev[trackId],
          currentTime: audio.currentTime,
        },
      }));
    }
  };

  const handleLoadedMetadata = (trackId: string) => {
    const audio = audioRefs.current[trackId];
    if (audio) {
      setTrackStates((prev) => ({
        ...prev,
        [trackId]: {
          ...prev[trackId],
          duration: audio.duration,
          isLoading: false,
        },
      }));
    }
  };

  const handleEnded = (trackId: string) => {
    setPlayingTrackId(null);
  };

  const handleSeek = (trackId: string, newTime: number) => {
    const audio = audioRefs.current[trackId];
    if (audio) {
      audio.currentTime = newTime;
      setTrackStates((prev) => ({
        ...prev,
        [trackId]: {
          ...prev[trackId],
          currentTime: newTime,
        },
      }));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case "GENERATING":
        return <Loader className="w-5 h-5 text-brand-600 animate-spin" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-danger-600" />;
      default:
        return <Clock className="w-5 h-5 text-neutral-400" />;
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

  const handleShare = async () => {
    if (!dream?.story) return;

    const storyData = {
      title: dream.story.title,
      content: dream.story.content,
      genre: dream.story.genre,
      wordCount: dream.story.wordCount,
      dreamTitle: dream.title,
      dreamDescription: dream.description,
      createdAt: dream.createdAt,
    };

    await shareStory(storyData);
  };

  if (isLoading) {
    return (
      <div className="theme-page">
        <div className="theme-container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 theme-text-secondary">Loading dream...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dream) {
    return (
      <div className="theme-page">
        <div className="theme-container py-8">
          <div className="text-center py-16">
            <XCircle className="w-16 h-16 text-danger-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold theme-text-primary mb-2">
              Dream Not Found
            </h2>
            <p className="theme-text-secondary mb-6">{error}</p>
            <button
              onClick={() => navigate("/dreams")}
              className="theme-btn-primary bg-neutral-800 border border-neutral-700"
            >
              Back to Dreams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page">
      <div className="theme-container py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dreams")}
            className="theme-btn-ghost mb-6 inline-flex items-center bg-neutral-800 border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dreams
          </button>

          <div className="theme-card">
            <div className="theme-card-body">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold theme-text-primary mb-4">
                    {dream.title}
                  </h1>
                  <p className="text-lg theme-text-secondary mb-6">
                    {dream.description}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm theme-text-muted">
                    <div className="flex bg-neutral-700 border border-neutral-600 rounded-xl px-2 py-1 items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created {new Date(dream.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex bg-neutral-700 border border-neutral-600 rounded-xl px-2 py-1 items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {
                          [
                            dream.generateStory,
                            dream.generateMusic,
                            dream.generateComic,
                          ].filter(Boolean).length
                        }{" "}
                        generations
                      </span>
                    </div>
                    {dream.user && (
                      <div className="flex bg-neutral-700 border border-neutral-600 rounded-xl px-2 py-1 items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>by @{dream.user.username}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={handleShare}
                    disabled={!dream.story || dream.storyStatus !== "COMPLETED"}
                    className="p-2 theme-badge-primary hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Share story"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Content */}
        <div className="space-y-8">
          {/* Story Row */}
          {dream.generateStory && (
            <div className="w-full">
              <div className="theme-card">
                <div className="theme-card-body">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="theme-icon-container-primary">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold theme-text-primary">
                          Story Book
                        </h2>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(dream.storyStatus)}
                          <span className="text-sm theme-text-secondary">
                            {getStatusText(dream.storyStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {dream.storyStatus === "COMPLETED" && dream.story ? (
                    <div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="theme-badge-primary">
                            {dream.story.genre}
                          </span>
                          <span className="text-sm theme-text-muted">
                            {dream.story.wordCount} words
                          </span>
                        </div>
                      </div>

                      <div className="bg-neutral-700 rounded-lg p-6 mb-4 max-h-64 overflow-hidden rounded-xl [mask-image:linear-gradient(to_bottom,white_80%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,white_80%,transparent)]">
                        <div className="prose prose-sm max-w-none">
                          {dream.story.content
                            .split("\n")
                            .map((paragraph, index) => (
                              <p
                                key={index}
                                className="mb-3 text-neutral-300 leading-relaxed"
                              >
                                {paragraph}
                              </p>
                            ))}
                        </div>
                      </div>

                      <Link
                        to={`/dreams/${dream.id}/story`}
                        className="theme-btn-primary w-full"
                      >
                        Read Full Story
                      </Link>
                    </div>
                  ) : dream.storyStatus === "GENERATING" ? (
                    <div className="text-center py-8">
                      <LoadingSpinner size="md" />
                      <p className="mt-4 theme-text-secondary">
                        Crafting your story...
                      </p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-4">
                        <div className="bg-brand-600 h-2 rounded-full animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  ) : dream.storyStatus === "FAILED" ? (
                    <div className="text-center py-8">
                      <XCircle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
                      <p className="theme-text-secondary">
                        Story generation failed. Please try again.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCwIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <p className="theme-text-secondary">
                        Story has been generated, please refresh the page.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comic Row */}
          {dream.generateComic && (
            <div className="w-full">
              <div className="theme-card">
                <div className="theme-card-body">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="theme-icon-container-primary">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold theme-text-primary">
                          Comic Strip
                        </h2>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(dream.comicStatus)}
                          <span className="text-sm theme-text-secondary">
                            {getStatusText(dream.comicStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {dream.comicStatus === "COMPLETED" && dream.comic ? (
                    <div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="theme-badge-primary">
                            Manga Style
                          </span>
                        </div>
                      </div>

                      {/* Comic Strip Display */}
                      {dream.comic.comicUrl && (
                        <div className="mb-6">
                          <div className="bg-neutral-800 rounded-lg p-4 ">
                            <img
                              src={dream.comic.comicUrl}
                              alt={dream.comic.title}
                              className="w-full h-auto rounded-lg"
                              style={{
                                maxHeight: "800px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Download Button */}
                      {dream.comic.comicUrl && (
                        <div className="mt-4">
                          <a
                            href={dream.comic.comicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn-primary w-full inline-flex items-center justify-center"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download Comic Strip
                          </a>
                        </div>
                      )}
                    </div>
                  ) : dream.comicStatus === "GENERATING" ? (
                    <div className="text-center py-8">
                      <LoadingSpinner size="md" />
                      <p className="mt-4 theme-text-secondary">
                        Creating your comic strip...
                      </p>
                      <p className="text-sm theme-text-muted mt-2">
                        This may take 3-5 minutes
                      </p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-4">
                        <div className="bg-brand-600 h-2 rounded-full animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ) : dream.comicStatus === "FAILED" ? (
                    <div className="text-center py-8">
                      <XCircle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
                      <p className="theme-text-secondary">
                        Comic generation failed. Please try again.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCwIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <p className="theme-text-secondary">
                        Comic has been generated, please refresh the page.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Music Row */}
          {dream.generateMusic && (
            <div className="w-full">
              <div className="theme-card">
                <div className="theme-card-body">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="theme-icon-container-primary">
                        <Music className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold theme-text-primary">
                          Theme Song
                        </h2>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(dream.musicStatus)}
                          <span className="text-sm theme-text-secondary">
                            {getStatusText(dream.musicStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {dream.musicStatus === "COMPLETED" &&
                  dream.music &&
                  dream.music.tracks?.length > 0 ? (
                    <div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="theme-badge-primary">
                            {dream.music.genre}
                          </span>
                          <span className="text-sm theme-text-muted">
                            {dream.music.tracks.length} track
                            {dream.music.tracks.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dream.music.tracks.map((track) => {
                          const trackState = trackStates[track.id] || {
                            currentTime: 0,
                            duration: 0,
                            isLoading: false,
                          };
                          const isPlaying = playingTrackId === track.id;

                          return (
                            <div
                              key={track.id}
                              className="bg-neutral-800 border border-neutral-700 rounded-xl rounded-lg p-6"
                            >
                              {/* Cover Image */}
                              {track.imageUrl && (
                                <div className="mb-4">
                                  <img
                                    src={track.imageUrl || "/placeholder.svg"}
                                    alt={`${track.title} cover`}
                                    className="w-full h-48 object-full rounded-lg shadow-md rounded-xl"
                                  />
                                </div>
                              )}

                              {/* Track Info */}
                              <div className="mb-4">
                                <h4 className="font-semibold text-white mb-1">
                                  {track.title}
                                </h4>
                                <div className="flex items-center justify-between text-sm text-brand-600">
                                  <span className="theme-badge-primary">
                                    {track.tags}
                                  </span>
                                  <span className="theme-badge-primary">
                                    {Math.round(track.duration || 0)}s
                                  </span>
                                </div>
                              </div>

                              {/* Music Player */}
                              {track.audioUrl && (
                                <div className="flex items-center justify-center space-x-4 mb-4">
                                  <button
                                    onClick={() =>
                                      togglePlayPause(track.id, track.audioUrl!)
                                    }
                                    className="w-12 h-12 theme-bg-gradient rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform duration-200"
                                  >
                                    {isPlaying ? (
                                      <Pause className="w-6 h-6" />
                                    ) : (
                                      <Play className="w-6 h-6 ml-1" />
                                    )}
                                  </button>
                                  <div className="flex-1 ">
                                    <input
                                      type="range"
                                      min="0"
                                      max={trackState.duration || 0}
                                      value={trackState.currentTime}
                                      onChange={(e) =>
                                        handleSeek(
                                          track.id,
                                          Number.parseFloat(e.target.value)
                                        )
                                      }
                                      className="w-full h-2 bg-white/100 rounded-full appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-brand-700 mt-1 ">
                                      <span className="theme-badge-primary">
                                        {formatTime(trackState.currentTime)}
                                      </span>
                                      <span className="theme-badge-primary">
                                        {formatTime(trackState.duration)}
                                      </span>
                                    </div>
                                  </div>
                                  <a
                                    href={track.audioUrl}
                                    download={`${track.title}.mp3`}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200 theme-badge-primary rounded-xl "
                                  >
                                    <Download className="w-5 h-5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : dream.musicStatus == "GENERATING" ? (
                    <div className="text-center py-8">
                      <LoadingSpinner size="md" />
                      <p className="mt-4 theme-text-secondary">
                        Composing your theme song...
                      </p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-4">
                        <div className="bg-brand-600 h-2 rounded-full animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  ) : dream.musicStatus === "FAILED" ? (
                    <div className="text-center py-8">
                      <XCircle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
                      <p className="theme-text-secondary">
                        Music generation failed. Please try again.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCwIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <p className="theme-text-secondary">
                        Music has been generated, please refesh the page.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamDetailPage;
