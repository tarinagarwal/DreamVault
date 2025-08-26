import api from "./auth";

export interface Dream {
  id: string;
  title: string;
  description: string;
  userId: string;
  isPublic: boolean;
  generateStory: boolean;
  generateMusic: boolean;
  generateComic: boolean;
  storyStatus: GenerationStatus;
  musicStatus: GenerationStatus;
  comicStatus: GenerationStatus;
  story?: Story;
  music?: Music;
  comic?: Comic;
  user?: {
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  dreamId: string;
  title: string;
  content: string;
  genre?: string;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Music {
  id: string;
  dreamId: string;
  title: string;
  description?: string;
  genre?: string;
  taskId?: string;
  tracks: MusicTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface MusicTrack {
  id: string;
  musicId: string;
  sunoId?: string;
  title: string;
  audioUrl?: string;
  sourceAudioUrl?: string;
  streamAudioUrl?: string;
  sourceStreamAudioUrl?: string;
  imageUrl?: string;
  sourceImageUrl?: string;
  duration?: number;
  prompt?: string;
  modelName?: string;
  tags?: string;
  createTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comic {
  id: string;
  dreamId: string;
  title: string;
  description?: string;
  comicUrl?: string;
  panels: ComicPanel[];
  createdAt: string;
  updatedAt: string;
}

export interface ComicPanel {
  id: string;
  comicId: string;
  panelNumber: number;
  imageUrl?: string;
  text?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type GenerationStatus =
  | "PENDING"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";

export interface CreateDreamRequest {
  title: string;
  description: string;
  generateStory: boolean;
  generateMusic: boolean;
  generateComic: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  dream?: Dream;
  dreams?: Dream[];
}

// Dreams API functions
export const dreamsAPI = {
  // Get all dreams
  getDreams: async (): Promise<ApiResponse<Dream[]>> => {
    const response = await api.get("/dreams");
    return response.data;
  },

  // Get all public dreams
  getPublicDreams: async (): Promise<ApiResponse<Dream[]>> => {
    const response = await api.get("/dreams/public");
    return response.data;
  },
  // Get a specific dream
  getDream: async (id: string): Promise<ApiResponse<Dream>> => {
    const response = await api.get(`/dreams/${id}`);
    return response.data;
  },

  // Get dream status for real-time updates
  getDreamStatus: async (
    id: string
  ): Promise<ApiResponse<{ story: string; music: string; comic: string }>> => {
    const response = await api.get(`/dreams/${id}/status`);
    return response.data;
  },
  // Create a new dream
  createDream: async (
    dreamData: CreateDreamRequest
  ): Promise<ApiResponse<Dream>> => {
    const response = await api.post("/dreams", dreamData);
    return response.data;
  },

  // Delete a dream
  deleteDream: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/dreams/${id}`);
    return response.data;
  },

  // Connect to Server-Sent Events for real-time updates
  connectToUpdates: (
    dreamId: string,
    onUpdate: (data: any) => void
  ): EventSource => {
    const eventSource = new EventSource(
      `${api.defaults.baseURL}/dreams/${dreamId}/events`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return eventSource;
  },
};
