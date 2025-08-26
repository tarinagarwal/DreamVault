import express from "express";
import { prisma } from "../index.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  generateStory,
  generateMusic,
  generateComic,
  checkMusicGenerationStatus,
} from "../utils/aiService.js";

const router = express.Router();

// Get all dreams for a user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const dreams = await prisma.dream.findMany({
      where: { userId: req.userId },
      include: {
        story: true,
        music: {
          include: {
            tracks: true,
          },
        },
        comic: {
          include: {
            panels: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      dreams,
    });
  } catch (error) {
    console.error("Get dreams error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all dreams (no authentication required, shows all dreams)
router.get("/public", async (req, res) => {
  try {
    const dreams = await prisma.dream.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        story: true,
        music: {
          include: {
            tracks: true,
          },
        },
        comic: {
          include: {
            panels: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to 50 most recent dreams
    });

    res.json({
      success: true,
      dreams,
    });
  } catch (error) {
    console.error("Get dreams error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
// Get a specific dream
router.get("/:id", async (req, res) => {
  try {
    const dream = await prisma.dream.findFirst({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        story: true,
        music: {
          include: {
            tracks: true,
          },
        },
        comic: {
          include: {
            panels: {
              orderBy: { panelNumber: "asc" },
            },
          },
        },
      },
    });

    if (!dream) {
      return res.status(404).json({
        success: false,
        message: "Dream not found",
      });
    }

    res.json({
      success: true,
      dream,
    });
  } catch (error) {
    console.error("Get dream error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Create a new dream
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, generateStory, generateMusic, generateComic } =
      req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    if (!generateStory && !generateMusic && !generateComic) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one generation option",
      });
    }

    // Create the dream
    const dream = await prisma.dream.create({
      data: {
        title,
        description,
        userId: req.userId,
        generateStory: !!generateStory,
        generateMusic: !!generateMusic,
        generateComic: !!generateComic,
        isPublic: true, // Always public now
        storyStatus: generateStory ? "GENERATING" : "PENDING",
        musicStatus: generateMusic ? "GENERATING" : "PENDING",
        comicStatus: generateComic ? "GENERATING" : "PENDING",
      },
    });

    // Start generation processes asynchronously
    if (generateStory) {
      generateStoryAsync(dream.id, title, description);
    }
    if (generateMusic) {
      generateMusicAsync(dream.id, title, description);
    }
    if (generateComic) {
      generateComicAsync(dream.id, title, description);
    }

    res.status(201).json({
      success: true,
      message: "Dream created successfully! Generation started.",
      dream,
    });
  } catch (error) {
    console.error("Create dream error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Async function to generate story
async function generateStoryAsync(dreamId, title, description) {
  try {
    console.log(`🎨 Starting story generation for dream ${dreamId}`);

    const storyContent = await generateStory(title, description);

    await prisma.story.create({
      data: {
        dreamId,
        title: `${title} - Story`,
        content: storyContent.content,
        genre: storyContent.genre,
        wordCount: storyContent.wordCount,
      },
    });

    await prisma.dream.update({
      where: { id: dreamId },
      data: { storyStatus: "COMPLETED" },
    });

    // Broadcast update to connected clients
    broadcastUpdate(dreamId, "storyCompleted", {
      status: "COMPLETED",
      story: storyContent,
    });

    console.log(`✅ Story generation completed for dream ${dreamId}`);
  } catch (error) {
    console.error(`❌ Story generation failed for dream ${dreamId}:`, error);
    await prisma.dream.update({
      where: { id: dreamId },
      data: { storyStatus: "FAILED" },
    });

    // Broadcast failure to connected clients
    broadcastUpdate(dreamId, "storyFailed", {
      status: "FAILED",
      error: error.message,
    });
  }
}

// Async function to generate comic
async function generateComicAsync(dreamId, title, description) {
  try {
    console.log(`🎨 Starting comic generation for dream ${dreamId}`);

    const comicContent = await generateComic(title, description);

    // Create comic record
    const comic = await prisma.comic.create({
      data: {
        dreamId,
        title: comicContent.title,
        description: comicContent.description,
        comicUrl: comicContent.comicUrl,
      },
    });

    // Create comic panels
    for (const panel of comicContent.panels) {
      await prisma.comicPanel.create({
        data: {
          comicId: comic.id,
          panelNumber: panel.panelNumber,
          imageUrl: comicContent.comicUrl, // All panels share the same comic strip URL
          text: panel.text,
          description: panel.description,
        },
      });
    }

    await prisma.dream.update({
      where: { id: dreamId },
      data: { comicStatus: "COMPLETED" },
    });

    // Broadcast update to connected clients
    broadcastUpdate(dreamId, "comicCompleted", {
      status: "COMPLETED",
      comic: comicContent,
    });

    console.log(`✅ Comic generation completed for dream ${dreamId}`);
  } catch (error) {
    console.error(`❌ Comic generation failed for dream ${dreamId}:`, error);
    await prisma.dream.update({
      where: { id: dreamId },
      data: { comicStatus: "FAILED" },
    });

    // Broadcast failure to connected clients
    broadcastUpdate(dreamId, "comicFailed", {
      status: "FAILED",
      error: error.message,
    });
  }
}

// Async function to generate music
async function generateMusicAsync(dreamId, title, description) {
  try {
    console.log(`🎵 Starting music generation for dream ${dreamId}`);

    const musicContent = await generateMusic(title, description);

    // Create music record
    const musicRecord = await prisma.music.create({
      data: {
        dreamId,
        title: `${title} - Theme Song`,
        description: musicContent.taskId
          ? `${musicContent.description} [TaskID: ${musicContent.taskId}]`
          : musicContent.description,
        genre: musicContent.genre,
        taskId: musicContent.taskId,
      },
    });

    // If we have a taskId, the music is generating and will be handled by callback
    if (musicContent.taskId && !musicContent.audioUrl) {
      console.log(
        `🔄 Music generation in progress, task: ${musicContent.taskId}`
      );
      console.log(
        `📞 Callback will be sent to: ${
          process.env.BACKEND_URL || "http://localhost:5000"
        }/api/dreams/suno-callback`
      );
      // The callback will handle completion
    } else {
      // Music is already complete (simulation mode)
      await prisma.dream.update({
        where: { id: dreamId },
        data: { musicStatus: "COMPLETED" },
      });

      // Broadcast update to connected clients
      broadcastUpdate(dreamId, "musicCompleted", {
        status: "COMPLETED",
        music: musicContent,
      });

      console.log(`✅ Music generation completed for dream ${dreamId}`);
    }
  } catch (error) {
    console.error(`❌ Music generation failed for dream ${dreamId}:`, error);
    await prisma.dream.update({
      where: { id: dreamId },
      data: { musicStatus: "FAILED" },
    });

    // Broadcast failure to connected clients
    broadcastUpdate(dreamId, "musicFailed", {
      status: "FAILED",
      error: error.message,
    });
  }
}
// Server-Sent Events for real-time updates
router.get("/:id/events", async (req, res) => {
  // Set headers for SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  const dreamId = req.params.id;

  // Send initial status
  try {
    const dream = await prisma.dream.findUnique({
      where: { id: dreamId },
      select: {
        id: true,
        storyStatus: true,
        musicStatus: true,
        comicStatus: true,
      },
    });

    if (dream) {
      res.write(
        `data: ${JSON.stringify({
          type: "status",
          data: {
            story: dream.storyStatus,
            music: dream.musicStatus,
            comic: dream.comicStatus,
          },
        })}\n\n`
      );
    }
  } catch (error) {
    console.error("SSE initial status error:", error);
  }

  // Store connection for later updates
  if (!global.sseConnections) {
    global.sseConnections = new Map();
  }

  if (!global.sseConnections.has(dreamId)) {
    global.sseConnections.set(dreamId, new Set());
  }

  global.sseConnections.get(dreamId).add(res);

  // Clean up on client disconnect
  req.on("close", () => {
    if (global.sseConnections.has(dreamId)) {
      global.sseConnections.get(dreamId).delete(res);
      if (global.sseConnections.get(dreamId).size === 0) {
        global.sseConnections.delete(dreamId);
      }
    }
  });
});

// Add WebSocket-like functionality for real-time updates
router.get("/:id/status", async (req, res) => {
  try {
    const dream = await prisma.dream.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        storyStatus: true,
        musicStatus: true,
        comicStatus: true,
      },
    });

    if (!dream) {
      return res.status(404).json({
        success: false,
        message: "Dream not found",
      });
    }

    res.json({
      success: true,
      status: {
        story: dream.storyStatus,
        music: dream.musicStatus,
        comic: dream.comicStatus,
      },
    });
  } catch (error) {
    console.error("Get dream status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete a dream
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const dream = await prisma.dream.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!dream) {
      return res.status(404).json({
        success: false,
        message: "Dream not found",
      });
    }

    await prisma.dream.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "Dream deleted successfully",
    });
  } catch (error) {
    console.error("Delete dream error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Test endpoint to verify callback URL is accessible
router.get("/suno-callback-test", (req, res) => {
  res.json({
    success: true,
    message: "Callback endpoint is accessible",
    timestamp: new Date().toISOString(),
    url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
  });
});

// Suno API callback endpoint
router.post("/suno-callback", async (req, res) => {
  try {
    console.log(
      "🎵 Received Suno callback:",
      JSON.stringify(req.body, null, 2)
    );

    const { code, msg, data } = req.body;

    if (!data || !data.task_id) {
      console.log("❌ Invalid callback format - missing task_id");
      return res
        .status(400)
        .json({ success: false, message: "Invalid callback format" });
    }

    const taskId = data.task_id;
    const callbackType = data.callbackType;
    const musicData = data.data || [];

    console.log(
      `📡 Callback for task ${taskId}, type: ${callbackType}, status: ${code}`
    );

    if (code === 200 && callbackType === "complete" && musicData.length > 0) {
      // Task completed successfully
      console.log(`✅ Music generation completed for task: ${taskId}`);

      // Find the music record by taskId in description
      let music = await prisma.music.findFirst({
        where: {
          description: { contains: taskId },
        },
        include: {
          dream: true,
          tracks: true,
        },
      });

      if (!music) {
        // Try to find by recent music records without tracks
        music = await prisma.music.findFirst({
          where: {
            tracks: { none: {} },
            createdAt: {
              gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
            },
          },
          include: {
            dream: true,
            tracks: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      if (music) {
        console.log(`🔍 Found music record: ${music.id}`);

        // Create music tracks for all generated tracks
        const createdTracks = [];
        for (const track of musicData) {
          const musicTrack = await prisma.musicTrack.create({
            data: {
              musicId: music.id,
              sunoId: track.id,
              title: track.title,
              audioUrl: track.audio_url,
              sourceAudioUrl: track.source_audio_url,
              streamAudioUrl: track.stream_audio_url,
              sourceStreamAudioUrl: track.source_stream_audio_url,
              imageUrl: track.image_url,
              sourceImageUrl: track.source_image_url,
              duration: track.duration,
              prompt: track.prompt,
              modelName: track.model_name,
              tags: track.tags,
              createTime: track.createTime
                ? new Date(track.createTime)
                : new Date(),
            },
          });
          createdTracks.push(musicTrack);
        }

        // Update the music record with task ID
        const updatedMusic = await prisma.music.update({
          where: { id: music.id },
          data: {
            taskId: taskId,
          },
          include: {
            tracks: true,
          },
        });

        // Update dream status
        await prisma.dream.update({
          where: { id: music.dreamId },
          data: { musicStatus: "COMPLETED" },
        });

        console.log(
          `✅ Created ${createdTracks.length} music tracks for dream ${music.dreamId}`
        );

        // Broadcast completion to connected clients
        broadcastUpdate(music.dreamId, "musicCompleted", {
          status: "COMPLETED",
          music: updatedMusic,
        });
      } else {
        console.log(`❌ No matching music record found for task: ${taskId}`);
      }
    } else if (code !== 200 || callbackType === "error") {
      // Task failed
      console.log(
        `❌ Music generation failed for task: ${taskId}, message: ${msg}`
      );

      // Try to find and update the corresponding dream
      const recentDream = await prisma.dream.findFirst({
        where: {
          musicStatus: "GENERATING",
          createdAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (recentDream) {
        await prisma.dream.update({
          where: { id: recentDream.id },
          data: { musicStatus: "FAILED" },
        });

        // Broadcast failure to connected clients
        broadcastUpdate(recentDream.id, "musicFailed", {
          status: "FAILED",
          error: msg || "Music generation failed",
        });
      }
    }

    // Return 200 status code to confirm callback received
    res.status(200).json({ status: "received" });
  } catch (error) {
    console.error("❌ Error processing Suno callback:", error);
    res
      .status(500)
      .json({ success: false, message: "Callback processing failed" });
  }
});

// Helper function to broadcast updates to SSE clients
function broadcastUpdate(dreamId, type, data) {
  if (global.sseConnections && global.sseConnections.has(dreamId)) {
    const connections = global.sseConnections.get(dreamId);
    const message = `data: ${JSON.stringify({ type, data })}\n\n`;

    connections.forEach((res) => {
      try {
        res.write(message);
      } catch (error) {
        console.error("Error broadcasting to SSE client:", error);
        connections.delete(res);
      }
    });
  }
}

export default router;
