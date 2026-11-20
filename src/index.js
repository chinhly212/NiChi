import { requireUser } from "./auth.js";
import { jsonError, jsonOk } from "./response.js";
import {
  createVideoRecord,
  deleteUserVideo,
  getUserVideoById,
  listUserVideos,
} from "./videos.js";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "GET" && path === "/health") {
      return jsonOk({ service: env.APP_NAME, status: "healthy", ts: Date.now() });
    }

    const { user, error } = await requireUser(request, env);
    if (error) return error;

    if (path === "/api/videos" && request.method === "POST") {
      return createVideoRecord(request, env, user);
    }

    if (path === "/api/videos" && request.method === "GET") {
      return listUserVideos(request, env, user);
    }

    const detailMatch = path.match(/^\/api\/videos\/([a-zA-Z0-9-]+)$/);
    if (detailMatch) {
      const videoId = detailMatch[1];
      if (request.method === "GET") {
        return getUserVideoById(env, user, videoId);
      }
      if (request.method === "DELETE") {
        return deleteUserVideo(env, user, videoId);
      }
    }

    return jsonError("Route not found", 404, "NOT_FOUND");
  },
};
        
