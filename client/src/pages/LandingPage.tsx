"use client";

import type React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Music,
  ImageIcon,
  Sparkles,
  Play,
  Globe,
  Zap,
  Shield,
  Heart,
  Github,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: "AI Story Generation",
      description:
        "Transform your dreams into captivating narratives with advanced AI storytelling",
    },
    {
      icon: Music,
      title: "Atmospheric Music",
      description:
        "Generate unique theme songs that capture the essence of your dreams",
    },
    {
      icon: ImageIcon,
      title: "Visual Comics",
      description:
        "Coming soon - Turn your dreams into beautiful comic strip illustrations",
    },
    {
      icon: Globe,
      title: "Dream Sharing",
      description: "Share your creations with the world",
    },
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Creative Writer",
      content:
        "Dream Vault turned my weird nightmare into the most beautiful story I've ever read. The AI captured emotions I couldn't even describe!",
      rating: 5,
    },
    {
      name: "Maya Patel",
      role: "Music Producer",
      content:
        "The music generation is incredible! It created a soundtrack that perfectly matched the mood of my dream sequence.",
      rating: 5,
    },
    {
      name: "Jordan Smith",
      role: "Artist",
      content:
        "I never thought my random dreams could become something so creative and shareable. This platform is pure magic!",
      rating: 5,
    },
  ];

  return (
    <div className="theme-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}

        <div className="theme-container min-h-screen theme-section flex items-center">
          <div className="relative text-center max-w-6xl mx-auto w-full">
            <div className="mb-8 sm:mb-12">
              <a
                href="https://github.com/tarinagarwal/DreamVault"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="inline-flex items-center theme-badge-primary mb-6 sm:mb-8 px-3 sm:px-4 py-2 text-sm sm:text-base">
                  <Github className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                  Star on Github
                </div>
              </a>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold theme-text-primary mb-4 sm:mb-6 theme-text-balance leading-[1.1] sm:leading-tight">
                Welcome to
                <span className="theme-text-gradient block mt-1 sm:mt-2">
                  Dream Vault
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl theme-text-secondary mb-8 sm:mb-12 max-w-4xl mx-auto theme-text-balance leading-relaxed px-4 sm:px-0">
                Where imagination meets AI creativity. Transform your dreams,
                thoughts, and ideas into magical stories, atmospheric music, and
                visual art.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dreams/create"
                    className="theme-btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 group transform hover:scale-105 transition-all duration-200"
                  >
                    Create Your Dream
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/dreams"
                    className="theme-btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 group transform hover:scale-105 transition-all duration-200"
                  >
                    <Play className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Enter Vault
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="theme-btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 group transform hover:scale-105 transition-all duration-200"
                  >
                    Start Dreaming
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/dreams"
                    className="theme-btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 group transform hover:scale-105 transition-all duration-200"
                  >
                    <Play className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Enter Vault
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="theme-section py-16 sm:py-20 lg:py-24">
        <div className="theme-container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold theme-text-primary mb-4 sm:mb-6 leading-tight">
              Unleash Your Creativity
            </h2>
            <p className="text-lg sm:text-xl theme-text-secondary max-w-3xl mx-auto leading-relaxed">
              Powerful AI tools to transform your imagination into tangible
              creative content
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="theme-card-hover group h-full">
                  <div className="theme-card-body text-center h-full flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <div className="theme-icon-container-primary mx-auto mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-5 sm:w-6 h-5 sm:h-6" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold theme-text-primary mb-3 sm:mb-4 leading-tight">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="theme-card max-w-6xl mx-auto">
            <div className="theme-card-body text-center p-6 sm:p-8 lg:p-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-text-primary mb-3 sm:mb-4">
                See Dream Vault in Action
              </h3>
              <p className="theme-text-secondary mb-8 sm:mb-12 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Watch how a simple dream becomes a complete creative experience
              </p>
              <div className="theme-card bg-neutral-700 border border-neutral-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 text-left">
                  <div className="space-y-3 sm:space-y-4 text-center md:text-left">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 bg-brand-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto md:mx-0 transform hover:scale-110 transition-transform duration-300">
                      <span className="text-brand-600 font-bold text-lg sm:text-xl">
                        1
                      </span>
                    </div>
                    <h4 className="font-semibold theme-text-primary text-base sm:text-lg">
                      Describe Your Dream
                    </h4>
                    <p className="text-sm sm:text-base theme-text-secondary leading-relaxed">
                      "I was flying through a crystal forest with glowing
                      butterflies..."
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4 text-center md:text-left">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto md:mx-0 transform hover:scale-110 transition-transform duration-300">
                      <span className="text-purple-600 font-bold text-lg sm:text-xl">
                        2
                      </span>
                    </div>
                    <h4 className="font-semibold theme-text-primary text-base sm:text-lg">
                      AI Creates Magic
                    </h4>
                    <p className="text-sm sm:text-base theme-text-secondary leading-relaxed">
                      Our AI generates a story, composes music, and creates
                      visuals
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4 text-center md:text-left">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 bg-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto md:mx-0 transform hover:scale-110 transition-transform duration-300">
                      <span className="text-pink-600 font-bold text-lg sm:text-xl">
                        3
                      </span>
                    </div>
                    <h4 className="font-semibold theme-text-primary text-base sm:text-lg">
                      Share & Enjoy
                    </h4>
                    <p className="text-sm sm:text-base theme-text-secondary leading-relaxed">
                      Experience your dream as a complete multimedia story
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="theme-section py-16 sm:py-20 lg:py-24">
        <div className="theme-container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold theme-text-primary mb-4 sm:mb-6 leading-tight">
              Perfect For Every Creative
            </h2>
            <p className="text-lg sm:text-xl theme-text-secondary max-w-3xl mx-auto leading-relaxed">
              Whether you're a writer, artist, or just someone with wild dreams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <div className="theme-card text-center h-full transform hover:scale-105 transition-all duration-300">
              <div className="theme-card-body text-center h-full flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="theme-icon-container-primary mx-auto mb-4 sm:mb-6 transform hover:rotate-12 transition-transform duration-300">
                    <BookOpen className="w-5 sm:w-6 h-5 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold theme-text-primary mb-3 sm:mb-4 leading-tight">
                    Writers & Storytellers
                  </h3>
                </div>
                <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                  Turn writer's block into creative breakthroughs. Generate
                  story ideas, develop characters, and explore new narrative
                  possibilities.
                </p>
              </div>
            </div>

            <div className="theme-card text-center h-full transform hover:scale-105 transition-all duration-300">
              <div className="theme-card-body text-center h-full flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="theme-icon-container-primary mx-auto mb-4 sm:mb-6 transform hover:rotate-12 transition-transform duration-300">
                    <Music className="w-5 sm:w-6 h-5 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold theme-text-primary mb-3 sm:mb-4 leading-tight">
                    Musicians & Composers
                  </h3>
                </div>
                <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                  Find inspiration for your next composition. Generate
                  atmospheric soundscapes and discover new musical directions.
                </p>
              </div>
            </div>

            <div className="theme-card text-center h-full transform hover:scale-105 transition-all duration-300">
              <div className="theme-card-body text-center h-full flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="theme-icon-container-primary mx-auto mb-4 sm:mb-6 transform hover:rotate-12 transition-transform duration-300">
                    <Sparkles className="w-5 sm:w-6 h-5 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold theme-text-primary mb-3 sm:mb-4 leading-tight">
                    Dream Enthusiasts
                  </h3>
                </div>
                <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                  Keep a digital dream journal that comes alive. Transform your
                  subconscious adventures into shareable creative content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="theme-section py-16 sm:py-20 lg:py-24">
        <div className="theme-container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold theme-text-primary mb-4 sm:mb-6 leading-tight">
              Powered by Advanced AI
            </h2>
            <p className="text-lg sm:text-xl theme-text-secondary max-w-3xl mx-auto leading-relaxed">
              Cutting-edge technology that brings your imagination to life
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
            <div className="space-y-6 sm:space-y-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-text-primary mb-4 sm:mb-6 flex items-center justify-center lg:justify-start">
                  <span className="text-3xl sm:text-4xl mr-3">🤖</span>
                  Intelligent Story Generation
                </h3>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-colors duration-200">
                  <Shield className="w-5 h-5 text-brand-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold theme-text-primary text-base sm:text-lg mb-1">
                      Advanced Language Models
                    </p>
                    <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                      Powered by state-of-the-art AI that understands context,
                      emotion, and narrative structure
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-colors duration-200">
                  <Zap className="w-5 h-5 text-brand-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold theme-text-primary text-base sm:text-lg mb-1">
                      Lightning Fast Processing
                    </p>
                    <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                      Generate complete stories in minutes, not hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-colors duration-200">
                  <Heart className="w-5 h-5 text-brand-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold theme-text-primary text-base sm:text-lg mb-1">
                      Emotionally Intelligent
                    </p>
                    <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                      AI that captures the emotional essence of your dreams
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-text-primary mb-4 sm:mb-6 flex items-center justify-center lg:justify-start">
                  <span className="text-3xl sm:text-4xl mr-3">🎵</span>
                  Professional Music Creation
                </h3>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-colors duration-200">
                  <Music className="w-5 h-5 text-brand-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold theme-text-primary text-base sm:text-lg mb-1">
                      AI Music Composition
                    </p>
                    <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                      Generate original soundtracks that match your dream's mood
                      and atmosphere
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-colors duration-200">
                  <Globe className="w-5 h-5 text-brand-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold theme-text-primary text-base sm:text-lg mb-1">
                      Multiple Genres
                    </p>
                    <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                      From ambient soundscapes to epic orchestral pieces
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-colors duration-200">
                  <Play className="w-5 h-5 text-brand-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold theme-text-primary text-base sm:text-lg mb-1">
                      High Quality Audio
                    </p>
                    <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
                      Professional-grade audio generation ready for any use
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
