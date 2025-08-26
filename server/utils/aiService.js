const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SUNO_API_KEY = process.env.SUNO_API_KEY;

// Generate story using Groq AI
export const generateStory = async (title, description) => {
  try {
    const prompt = `Transform this dream/idea into an engaging short story:

Title: ${title}
Description: ${description}

Please create a captivating short story (800-1200 words) that brings this dream to life. Include:
- Rich, vivid descriptions
- Character development
- A clear narrative arc
- Imaginative elements that capture the dream-like quality
- An engaging beginning, middle, and end

Make it feel magical and immersive, as if the reader is experiencing the dream themselves.

Story:`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Using available model
          messages: [
            {
              role: "system",
              content:
                "You are a creative storyteller who specializes in transforming dreams and abstract ideas into compelling narratives. Write in an engaging, descriptive style that captures the surreal and magical nature of dreams.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const storyContent = data.choices[0].message.content;

    // Determine genre based on content
    const genre = determineGenre(description);
    const wordCount = storyContent.split(" ").length;

    return {
      content: storyContent,
      genre,
      wordCount,
    };
  } catch (error) {
    console.error("Story generation error:", error);
    throw new Error("Failed to generate story");
  }
};

// Generate music using Suno API
export const generateMusic = async (title, description) => {
  try {
    if (!SUNO_API_KEY) {
      console.log("🎵 No Suno API key found, simulating music generation...");

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const genre = determineMusicGenre(description);

      return {
        description: `Atmospheric ${genre.toLowerCase()} theme song inspired by: ${description}`,
        audioUrl: null, // Placeholder for actual audio file
        duration: Math.floor(Math.random() * 60) + 30, // Random duration between 30-90 seconds
        genre,
      };
    }

    console.log(`🎵 Generating music with Suno API for: ${title}`);

    // Create a music prompt based on the dream
    const musicPrompt = createMusicPrompt(title, description);
    const genre = determineMusicGenre(description);

    const callbackUrl = `${
      process.env.BACKEND_URL || "http://localhost:5000"
    }/api/dreams/suno-callback`;

    // Prepare the request payload for Suno API v1
    const payload = {
      prompt: musicPrompt,
      style: genre,
      title: `${title} - Theme Song`,
      customMode: true,
      instrumental: false, // Set to true if you want instrumental only
      model: "V3_5",
      callBackUrl: callbackUrl,
      styleWeight: 0.65,
      weirdnessConstraint: 0.65,
      audioWeight: 0.65,
    };

    console.log(`📞 Callback URL configured: ${callbackUrl}`);

    // Make request to Suno API v1
    const response = await fetch("https://api.sunoapi.org/api/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUNO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Suno API error response: ${errorText}`);
      throw new Error(
        `Suno API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Suno API response:", data);

    // Handle the response format from Suno API - check for task-based response first
    if (data.code === 200 && data.data && data.data.taskId) {
      console.log(
        `✅ Music generation task created with ID: ${data.data.taskId}`
      );

      // Start polling for completion in the background
      pollMusicGeneration(data.data.taskId, title, genre);

      return {
        description: `${genre} theme song for: ${title}`,
        audioUrl: null, // Will be updated when generation completes
        duration: 30, // Default duration
        genre,
        taskId: data.data.taskId, // Store task ID for later retrieval
      };
    }

    // Handle different response formats for direct track responses
    let tracks = [];
    if (Array.isArray(data)) {
      tracks = data;
    } else if (data.data && Array.isArray(data.data)) {
      tracks = data.data;
    } else if (data.tracks && Array.isArray(data.tracks)) {
      tracks = data.tracks;
    } else if (data.id) {
      // Single track response
      tracks = [data];
    } else {
      console.error("Unexpected Suno API response format:", data);
      throw new Error("Invalid response format from Suno API");
    }

    if (tracks.length === 0) {
      throw new Error("No tracks returned from Suno API");
    }

    // Handle direct track response (if any)
    const track = tracks[0];

    console.log(`✅ Music generated successfully with Suno API`);

    return {
      description: `${genre} theme song: ${track.title || title}`,
      audioUrl: track.audio_url || track.audioUrl,
      duration: track.duration || 30, // Default to 30 seconds if not provided
      genre,
      taskId: track.id,
    };
  } catch (error) {
    console.error("Music generation error:", error);

    // Fallback to simulation if API fails
    console.log("🎵 Falling back to simulation due to API error...");
    const genre = determineMusicGenre(description);

    return {
      description: `Atmospheric ${genre.toLowerCase()} theme song inspired by: ${description}`,
      audioUrl: null,
      duration: Math.floor(Math.random() * 60) + 30,
      genre,
    };
  }
};

// Function to poll music generation status and update database when complete
const pollMusicGeneration = async (taskId, title, genre) => {
  const maxAttempts = 30; // Poll for up to 15 minutes (30 attempts * 30 seconds)
  let attempts = 0;

  const poll = async () => {
    try {
      attempts++;

      const statusData = await checkMusicGenerationStatus(taskId);

      if (statusData.code === 200 && statusData.data) {
        // Handle the new API response format
        let tracks = [];
        if (statusData.data.response && statusData.data.response.sunoData) {
          tracks = statusData.data.response.sunoData;
        } else if (Array.isArray(statusData.data)) {
          tracks = statusData.data;
        } else {
          tracks = [statusData.data];
        }

        // Check if any track is completed
        const completedTrack = tracks.find(
          (track) =>
            track.status === "SUCCESS" && (track.audio_url || track.audioUrl)
        );

        if (completedTrack) {
          console.log(`✅ Music generation completed for task: ${taskId}`);

          // Update the music record in database
          await updateMusicWithGeneratedContent(taskId, {
            audioUrl: completedTrack.audio_url || completedTrack.audioUrl,
            duration: completedTrack.duration || 30,
            title: completedTrack.title || `${title} - Theme Song`,
          });

          return; // Stop polling
        }

        // Check for failed status
        const failedTrack = tracks.find(
          (track) =>
            track.status === "CREATE_TASK_FAILED" ||
            track.status === "GENERATE_AUDIO_FAILED" ||
            track.status === "SENSITIVE_WORD_ERROR"
        );

        if (failedTrack) {
          console.log(
            `❌ Music generation failed for task: ${taskId}, status: ${failedTrack.status}`
          );
          await markMusicAsFailed(taskId);
          return; // Stop polling
        }

        // Continue polling if still pending
        if (attempts < maxAttempts) {
          setTimeout(poll, 30000); // Poll every 30 seconds
        } else {
          console.log(`⏰ Polling timeout for task: ${taskId}`);
          await markMusicAsFailed(taskId);
        }
      }
    } catch (error) {
      console.error(`❌ Error polling task ${taskId}:`, error);
      if (attempts < maxAttempts) {
        setTimeout(poll, 30000); // Retry after 30 seconds
      } else {
        await markMusicAsFailed(taskId);
      }
    }
  };

  // Start polling after 30 seconds (give Suno time to start processing)
  setTimeout(poll, 30000);
};

// Helper function to update music record with generated content
const updateMusicWithGeneratedContent = async (taskId, musicData) => {
  try {
    // We need to import prisma here or pass it as parameter
    // For now, we'll handle this in the dreams route
    console.log(`🎵 Music ready for task ${taskId}:`, musicData);

    // This will be handled by a callback or polling mechanism in the routes
    // The actual database update should happen in the dreams route
  } catch (error) {
    console.error("Error updating music record:", error);
  }
};

// Helper function to mark music as failed
const markMusicAsFailed = async (taskId) => {
  try {
    console.log(`❌ Marking music as failed for task: ${taskId}`);
    // This will be handled in the dreams route
  } catch (error) {
    console.error("Error marking music as failed:", error);
  }
};

// Function to check music generation status using taskId
export const checkMusicGenerationStatus = async (taskId) => {
  try {
    if (!SUNO_API_KEY) {
      throw new Error("Suno API key not configured");
    }

    const response = await fetch(
      `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SUNO_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Suno API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    // console.log(`📊 Status check for task ${taskId}:`, data);
    return data;
  } catch (error) {
    console.error("Error checking music generation status:", error);
    throw error;
  }
};

// Alternative function for custom music generation with more control
export const generateCustomMusic = async (title, description, options = {}) => {
  try {
    if (!SUNO_API_KEY) {
      throw new Error("Suno API key not configured");
    }

    const musicPrompt = createMusicPrompt(title, description);
    const genre = determineMusicGenre(description);

    const payload = {
      prompt: musicPrompt,
      style: options.style || genre,
      title: options.title || `${title} - Theme Song`,
      customMode: true,
      instrumental: options.instrumental || false,
      model: options.model || "V3_5",
      callBackUrl:
        options.callBackUrl ||
        `${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/api/dreams/suno-callback`,
      styleWeight: options.styleWeight || 0.65,
      weirdnessConstraint: options.weirdnessConstraint || 0.65,
      audioWeight: options.audioWeight || 0.65,
      ...options, // Allow additional options to be passed through
    };

    const response = await fetch("https://api.sunoapi.org/api/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUNO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Suno API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Handle response similar to generateMusic
    let tracks = [];
    if (Array.isArray(data)) {
      tracks = data;
    } else if (data.data && Array.isArray(data.data)) {
      tracks = data.data;
    } else if (data.id) {
      tracks = [data];
    }

    if (tracks.length === 0) {
      throw new Error("No tracks returned from Suno API");
    }

    const track = tracks[0];

    return {
      description: `${genre} theme song: ${track.title || title}`,
      audioUrl: track.audio_url || track.audioUrl,
      duration: track.duration || 30,
      genre,
      generationId: track.id,
    };
  } catch (error) {
    console.error("Custom music generation error:", error);
    throw error;
  }
};

// Function to get account information and credits
export const getSunoAccountInfo = async () => {
  try {
    if (!SUNO_API_KEY) {
      throw new Error("Suno API key not configured");
    }

    const response = await fetch("https://api.sunoapi.org/api/v1/account", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SUNO_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Suno API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting Suno account info:", error);
    throw error;
  }
};

// Helper function to determine story genre
const determineGenre = (description) => {
  const lowerDesc = description.toLowerCase();

  if (
    lowerDesc.includes("magic") ||
    lowerDesc.includes("wizard") ||
    lowerDesc.includes("dragon")
  ) {
    return "Fantasy";
  } else if (
    lowerDesc.includes("space") ||
    lowerDesc.includes("robot") ||
    lowerDesc.includes("future")
  ) {
    return "Science Fiction";
  } else if (
    lowerDesc.includes("scary") ||
    lowerDesc.includes("monster") ||
    lowerDesc.includes("dark")
  ) {
    return "Horror";
  } else if (
    lowerDesc.includes("love") ||
    lowerDesc.includes("heart") ||
    lowerDesc.includes("romance")
  ) {
    return "Romance";
  } else if (
    lowerDesc.includes("adventure") ||
    lowerDesc.includes("journey") ||
    lowerDesc.includes("quest")
  ) {
    return "Adventure";
  } else {
    return "Fantasy"; // Default for dreams
  }
};

// Helper function to determine music genre
const determineMusicGenre = (description) => {
  const lowerDesc = description.toLowerCase();

  if (
    lowerDesc.includes("peaceful") ||
    lowerDesc.includes("calm") ||
    lowerDesc.includes("serene")
  ) {
    return "Ambient";
  } else if (
    lowerDesc.includes("action") ||
    lowerDesc.includes("chase") ||
    lowerDesc.includes("fast")
  ) {
    return "Electronic";
  } else if (
    lowerDesc.includes("magical") ||
    lowerDesc.includes("fantasy") ||
    lowerDesc.includes("mystical")
  ) {
    return "Orchestral";
  } else if (
    lowerDesc.includes("scary") ||
    lowerDesc.includes("dark") ||
    lowerDesc.includes("monster")
  ) {
    return "Dark Ambient";
  } else {
    return "Cinematic"; // Default
  }
};

// Generate comic using Python comic generation service
export const generateComic = async (title, description) => {
  try {
    const comicServiceUrl =
      process.env.COMIC_SERVICE_URL || "http://localhost:5001";

    console.log(`🎨 Generating comic for: ${title}`);

    const response = await fetch(`${comicServiceUrl}/generate-comic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        story: `${title}: ${description}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Comic service error: ${errorText}`);
      throw new Error(
        `Comic service error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Comic generation failed");
    }

    console.log(`✅ Comic generated successfully: ${data.comic_url}`);

    return {
      title: `${title} - Comic Strip`,
      description: data.characters_description,
      comicUrl: data.comic_url,
      panels: data.panels,
      style: data.style,
    };
  } catch (error) {
    console.error("Comic generation error:", error);
    throw new Error("Failed to generate comic");
  }
};

// Helper function to create music prompt
const createMusicPrompt = (title, description) => {
  const genre = determineMusicGenre(description);
  const lowerDesc = description.toLowerCase();

  // Create more specific prompts based on content
  if (
    lowerDesc.includes("peaceful") ||
    lowerDesc.includes("calm") ||
    lowerDesc.includes("serene")
  ) {
    return `peaceful ambient ${genre.toLowerCase()} music, soft and calming, inspired by ${description}`;
  } else if (
    lowerDesc.includes("action") ||
    lowerDesc.includes("chase") ||
    lowerDesc.includes("running")
  ) {
    return `energetic ${genre.toLowerCase()} music with driving rhythm, inspired by ${description}`;
  } else if (
    lowerDesc.includes("magical") ||
    lowerDesc.includes("fantasy") ||
    lowerDesc.includes("mystical")
  ) {
    return `mystical orchestral ${genre.toLowerCase()} music with ethereal elements, inspired by ${description}`;
  } else if (
    lowerDesc.includes("scary") ||
    lowerDesc.includes("dark") ||
    lowerDesc.includes("monster")
  ) {
    return `dark atmospheric ${genre.toLowerCase()} music with suspenseful elements, inspired by ${description}`;
  } else {
    return `cinematic ${genre.toLowerCase()} music that captures the essence of ${description}`;
  }
};
