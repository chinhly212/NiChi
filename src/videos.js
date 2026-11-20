import { jsonError, jsonOk } from "./response.js";

function dbHeaders(env) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

export async function createVideoRecord(request, env, user) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const {
    telegram_message_id,
    file_name,
    size_before,
    size_after,
    duration_sec = 0,
    thumbnail_url = null,
  } = body;

  if (!telegram_message_id || !file_name || size_after == null) {
    return jsonError("Missing telegram_message_id, file_name, or size_after", 422);
  }

  const payload = {
    user_id: user.id,
    telegram_chat_id: String(env.TELEGRAM_CHANNEL_ID),
    telegram_message_id: Number(telegram_message_id),
    file_name: String(file_name),
    size_before: Number(size_before || 0),
    size_after: Number(size_after),
    duration_sec: Number(duration_sec),
    thumbnail_url,
    status: "done",
  };

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/videos`, {
    method: "POST",
    headers: dbHeaders(env),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    return jsonError(`Database insert failed: ${errText}`, 500, "DB_ERROR");
  }

  const rows = await res.json();
  return jsonOk(rows[0], 201);
}

export async function listUserVideos(request, env, user) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 20), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") || 0), 0);

  const query =
    `${env.SUPABASE_URL}/rest/v1/videos` +
    `?user_id=eq.${encodeURIComponent(user.id)}` +
    `&order=created_at.desc&limit=${limit}&offset=${offset}`;

  const res = await fetch(query, { headers: dbHeaders(env) });
  if (!res.ok) {
    return jsonError("Failed to load user videos", 500, "DB_ERROR");
  }

  const items = await res.json();
  return jsonOk({ items, limit, offset });
}

export async function getUserVideoById(env, user, videoId) {
  const query =
    `${env.SUPABASE_URL}/rest/v1/videos` +
    `?id=eq.${encodeURIComponent(videoId)}` +
    `&user_id=eq.${encodeURIComponent(user.id)}&select=*`;

  const res = await fetch(query, { headers: dbHeaders(env) });
  if (!res.ok) {
    return jsonError("Database error", 500, "DB_ERROR");
  }

  const rows = await res.json();
  if (!rows.length) {
    return jsonError("Video not found", 404, "NOT_FOUND");
  }

  return jsonOk(rows[0]);
}

export async function deleteUserVideo(env, user, videoId) {
  const query =
    `${env.SUPABASE_URL}/rest/v1/videos` +
    `?id=eq.${encodeURIComponent(videoId)}` +
    `&user_id=eq.${encodeURIComponent(user.id)}`;

  const res = await fetch(query, {
    method: "DELETE",
    headers: dbHeaders(env),
  });

  if (!res.ok) {
    return jsonError("Failed to delete video", 500, "DB_ERROR");
  }

  return jsonOk({ deleted: true, id: videoId });
}
