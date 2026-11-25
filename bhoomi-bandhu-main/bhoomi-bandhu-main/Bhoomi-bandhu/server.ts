import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";
import crypto from "crypto";
import {
  GoogleGenAI,
  ThinkingLevel,
  type GenerateContentResponse,
} from "@google/genai";
import {
  estimateMonthlyRainfallMm,
  inferRegionalSoilDefaults,
} from "./src/utils/cropAdvisor.ts";
import {
  buildNoReplyAccessEmail,
  validateEmployeeProvisionInput,
} from "./src/utils/employeeAccess.ts";
import {
  SlidingWindowRateLimiter,
  sanitizePortalUrl,
  signServerSessionToken,
  stripEmailHeaderInjection,
  verifyServerSessionToken,
} from "./src/utils/serverSecurity.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

function describeWeatherCode(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code === 45 || code === 48) return "Foggy / Mist";
  if (code >= 51 && code <= 67) return "Rain / Drizzle";
  if (code >= 71 && code <= 77) return "Cold / Frost conditions";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Seasonal conditions";
}

const SYSTEM_INSTRUCTION = `You are BhoomiBandhu ("A Trusted Friend for Every Farmer"), a warm, practical, and honest agricultural assistant for Indian farmers.

Core principles:
1. Language & Tone: Speak in simple, clear, respectful everyday English (and understand common Hindi agricultural terms like Kharif, Rabi, Zaid, Mandi, Quintal, Beegha, KCC, PM-KISAN, PMFBY). Avoid complex jargon or robotic bullet dumps.
2. Honesty & Safety:
   - Never fabricate government scheme amounts, deadlines, or official URLs if you are unsure. Tell the farmer to verify exact dates on the official portal (e.g., pmkisan.gov.in, pmfby.gov.in) or at their nearest Common Service Centre (CSC) / Krishi Vigyan Kendra (KVK).
   - Never give medical or psychiatric diagnoses. If a farmer expresses distress or mental health struggles, respond with warmth and gently share India's toll-free Tele-MANAS helpline (14416) and Kisan Call Centre (1800-180-1551).
   - Crop recommendations are suggestions based on soil and weather factors, never guaranteed yield promises.
3. Structure & Conciseness: Keep answers clear, warm, and concise (aim for under 180 words unless the farmer asks for full step-by-step instructions), organized with short bullet points or numbered steps.`;

interface IncomingMessage {
  role: "user" | "model";
  text: string;
}

type ChatMode = "balanced" | "fast" | "deep";

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const ADMIN_BOOTSTRAP_EMAIL = "pranav25dhiman1107@gmail.com";

function readFirebaseApiKey(): string | null {
  try {
    const raw = fs.readFileSync(
      path.resolve(__dirname, "firebase-applet-config.json"),
      "utf-8"
    );
    const parsed = JSON.parse(raw) as { apiKey?: string };
    return parsed.apiKey || null;
  } catch {
    return null;
  }
}

async function verifyAdminBearerToken(
  authHeader: string | undefined
): Promise<{ ok: boolean; email?: string }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false };
  }
  const idToken = authHeader.slice(7).trim();
  const apiKey = readFirebaseApiKey();
  if (!idToken || !apiKey) return { ok: false };

  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!resp.ok) return { ok: false };
    const data = (await resp.json()) as {
      users?: Array<{ email?: string; emailVerified?: boolean }>;
    };
    const account = data.users?.[0];
    if (
      account?.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL &&
      account?.emailVerified === true
    ) {
      return { ok: true, email: account.email };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === "production";

  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' ws: wss: https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://api.open-meteo.com https://geocoding-api.open-meteo.com",
        "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
      ].join("; ")
    );
    if (isProd) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );
    }
    next();
  });

  app.use(express.json({ limit: "1mb" }));

  const authRateLimiter = new SlidingWindowRateLimiter(25, 15 * 60 * 1000);
  const apiRateLimiter = new SlidingWindowRateLimiter(60, 60 * 1000);

  function rateLimit(
    limiter: SlidingWindowRateLimiter,
    errorMessage: string
  ): express.RequestHandler {
    return (req, res, next) => {
      const clientKey = req.ip || req.socket.remoteAddress || "unknown";
      const result = limiter.check(clientKey);
      if (!result.allowed) {
        res.setHeader("Retry-After", String(result.retryAfterSec));
        res.status(429).json({ error: errorMessage });
        return;
      }
      next();
    };
  }

  const limitAuth = rateLimit(
    authRateLimiter,
    "Too many authentication attempts. Please wait a few minutes and try again."
  );
  const limitApi = rateLimit(
    apiRateLimiter,
    "Too many requests right now. Please slow down and try again shortly."
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "bhoomibandhu-api" });
  });

  const AUTH_STORE_FILE = "/tmp/bhoomibandhu-accounts.json";

  interface ServerAccountRecord {
    id: string;
    role: "farmer" | "warehouse_owner" | "psychiatrist" | "support_staff";
    name: string;
    email: string;
    state: string;
    district: string;
    phone: string;
    landSizeAcres: number;
    primaryCrops: string[];
    specialization?: string;
    qualification?: string;
    department?: string;
    mustChangePassword: boolean;
    salt: string;
    passwordHash: string;
    createdAtIso: string;
  }

  function loadServerAccounts(): ServerAccountRecord[] {
    try {
      if (!fs.existsSync(AUTH_STORE_FILE)) return [];
      const raw = fs.readFileSync(AUTH_STORE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as ServerAccountRecord[]) : [];
    } catch {
      return [];
    }
  }

  function saveServerAccounts(accounts: ServerAccountRecord[]) {
    try {
      fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(accounts, null, 2));
    } catch {
      // Ignore write failures in read-only edge cases; in-memory/localStorage still persists
    }
  }

  let serverAccountsCache: ServerAccountRecord[] = loadServerAccounts();

  function hashServerPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString("hex");
  }

  function verifyServerPassword(
    password: string,
    salt: string,
    expectedHex: string
  ): boolean {
    const computed = hashServerPassword(password, salt);
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(expectedHex, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  function toPublicServerAccount(acc: ServerAccountRecord) {
    const badge =
      acc.role === "warehouse_owner"
        ? "Warehouse"
        : acc.role === "psychiatrist"
        ? "Doctor"
        : acc.role === "support_staff"
        ? "Support Staff"
        : "Farmer";
    return {
      id: acc.id,
      role: acc.role,
      label:
        acc.role === "support_staff"
          ? "Support Employee"
          : `${badge} Account`,
      badge,
      name: acc.name,
      email: acc.email,
      state: acc.state,
      district: acc.district,
      phone: acc.phone,
      landSizeAcres: acc.landSizeAcres,
      primaryCrops: acc.primaryCrops,
      specialization: acc.specialization,
      qualification: acc.qualification,
      department: acc.department,
      mustChangePassword: acc.mustChangePassword,
      summary: "Registered BhoomiBandhu account.",
    };
  }

  app.post("/api/auth/register", limitAuth, async (req, res) => {
    const body = req.body as {
      id?: unknown;
      name?: unknown;
      email?: unknown;
      password?: unknown;
      role?: unknown;
      state?: unknown;
      district?: unknown;
      specialization?: unknown;
      qualification?: unknown;
      department?: unknown;
      mustChangePassword?: unknown;
    };

    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase().slice(0, 160)
        : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const rawRole = typeof body?.role === "string" ? body.role : "farmer";

    if (rawRole === "support_staff") {
      const adminCheck = await verifyAdminBearerToken(
        req.headers.authorization
      );
      if (!adminCheck.ok) {
        res.status(403).json({
          error:
            "Administrator authorization is required to provision support employee accounts.",
        });
        return;
      }
    }

    const role: ServerAccountRecord["role"] =
      rawRole === "warehouse_owner" ||
      rawRole === "psychiatrist" ||
      rawRole === "support_staff"
        ? rawRole
        : "farmer";

    if (!name || !email.includes("@") || password.length < 6 || password.length > 128) {
      res.status(400).json({
        error: "Valid name, email, and a password between 6 and 128 characters are required.",
      });
      return;
    }

    if (email === ADMIN_BOOTSTRAP_EMAIL) {
      res.status(403).json({
        error:
          "This administrator email is reserved. Please sign in with Google.",
      });
      return;
    }

    const exists = serverAccountsCache.some((a) => a.email === email);
    if (exists) {
      res.status(409).json({
        error: "An account with this email already exists. Please log in instead.",
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashServerPassword(password, salt);
    const state =
      typeof body?.state === "string" ? body.state.trim().slice(0, 80) : "";
    const district =
      typeof body?.district === "string"
        ? body.district.trim().slice(0, 80)
        : "";

    const safeId =
      typeof body?.id === "string" && /^[a-zA-Z0-9_-]{3,128}$/.test(body.id)
        ? body.id
        : `app_${role}_${Date.now()}`;

    const record: ServerAccountRecord = {
      id: safeId,
      role,
      name,
      email,
      state,
      district,
      phone: "",
      landSizeAcres: role === "farmer" ? 2.5 : 0,
      primaryCrops: role === "farmer" ? ["Wheat"] : [],
      specialization:
        typeof body?.specialization === "string" && body.specialization.trim()
          ? body.specialization.trim().slice(0, 100)
          : role === "psychiatrist"
          ? "Rural Stress & Farmer Well-Being"
          : undefined,
      qualification:
        typeof body?.qualification === "string" && body.qualification.trim()
          ? body.qualification.trim().slice(0, 100)
          : role === "psychiatrist"
          ? "MD Psychiatry"
          : undefined,
      department:
        typeof body?.department === "string" && body.department.trim()
          ? body.department.trim().slice(0, 80)
          : undefined,
      mustChangePassword: Boolean(body?.mustChangePassword),
      salt,
      passwordHash,
      createdAtIso: new Date().toISOString(),
    };

    serverAccountsCache = [record, ...serverAccountsCache];
    saveServerAccounts(serverAccountsCache);

    const sessionToken = signServerSessionToken(
      { uid: record.id, email: record.email, role: record.role },
      SESSION_SECRET
    );

    res.status(201).json({
      ok: true,
      account: toPublicServerAccount(record),
      sessionToken,
    });
  });

  app.post("/api/auth/login", limitAuth, (req, res) => {
    const body = req.body as { email?: unknown; password?: unknown };
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase().slice(0, 160)
        : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password || password.length > 128) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const found = serverAccountsCache.find((a) => a.email === email);
    if (!found) {
      res.status(404).json({ error: "ACCOUNT_NOT_FOUND" });
      return;
    }

    if (!verifyServerPassword(password, found.salt, found.passwordHash)) {
      res.status(401).json({
        error:
          "Incorrect email or password. Please check your credentials and try again.",
      });
      return;
    }

    const sessionToken = signServerSessionToken(
      { uid: found.id, email: found.email, role: found.role },
      SESSION_SECRET
    );

    res.json({
      ok: true,
      account: toPublicServerAccount(found),
      sessionToken,
    });
  });

  app.post("/api/auth/change-password", limitAuth, (req, res) => {
    const body = req.body as {
      email?: unknown;
      currentPassword?: unknown;
      newPassword?: unknown;
    };
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase().slice(0, 160)
        : "";
    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!email || newPassword.length < 6 || newPassword.length > 128) {
      res.status(400).json({
        error: "Valid email and new password (6-128 characters) are required.",
      });
      return;
    }

    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : "";
    const tokenPayload = bearerToken
      ? verifyServerSessionToken(bearerToken, SESSION_SECRET)
      : null;
    const hasMatchingToken = Boolean(
      tokenPayload && tokenPayload.email === email
    );

    if (!hasMatchingToken && !currentPassword) {
      res.status(401).json({
        error:
          "Authentication or your current password is required to change your password.",
      });
      return;
    }

    const idx = serverAccountsCache.findIndex((a) => a.email === email);
    if (idx === -1) {
      res.status(hasMatchingToken ? 404 : 401).json({
        error: hasMatchingToken
          ? "ACCOUNT_NOT_FOUND"
          : "Invalid credentials or session.",
      });
      return;
    }

    if (!hasMatchingToken) {
      const target = serverAccountsCache[idx];
      if (
        !verifyServerPassword(currentPassword, target.salt, target.passwordHash)
      ) {
        res.status(401).json({
          error: "Current password verification failed.",
        });
        return;
      }
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashServerPassword(newPassword, salt);
    serverAccountsCache[idx] = {
      ...serverAccountsCache[idx],
      salt,
      passwordHash,
      mustChangePassword: false,
    };
    saveServerAccounts(serverAccountsCache);

    const updated = serverAccountsCache[idx];
    const sessionToken = signServerSessionToken(
      { uid: updated.id, email: updated.email, role: updated.role },
      SESSION_SECRET
    );

    res.json({
      ok: true,
      account: toPublicServerAccount(updated),
      sessionToken,
    });
  });

  app.post("/api/auth/reset-password", limitAuth, (req, res) => {
    const body = req.body as { email?: unknown };
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase().slice(0, 160)
        : "";

    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }

    res.json({
      ok: true,
      message:
        "If an account exists for that email, password recovery instructions have been sent.",
    });
  });

  app.get("/api/weather", limitApi, async (req, res) => {
    const rawLocation = String(req.query.location || "")
      .trim()
      .slice(0, 100);
    if (rawLocation.length < 2) {
      res.status(400).json({
        error: "Please type a town, district, or city name (at least 2 characters).",
      });
      return;
    }

    try {
      const geoUrlIn = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        rawLocation
      )}&count=5&language=en&format=json&countryCode=IN`;
      const geoResIn = await fetch(geoUrlIn);
      if (!geoResIn.ok) {
        throw new Error(`Geocoding service responded with ${geoResIn.status}`);
      }
      let geoData = (await geoResIn.json()) as {
        results?: Array<{
          name: string;
          admin1?: string;
          country?: string;
          latitude: number;
          longitude: number;
        }>;
      };

      if (!geoData.results || geoData.results.length === 0) {
        const geoUrlGlobal = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          rawLocation
        )}&count=3&language=en&format=json`;
        const geoResGlobal = await fetch(geoUrlGlobal);
        if (geoResGlobal.ok) {
          geoData = (await geoResGlobal.json()) as typeof geoData;
        }
      }

      const place = geoData.results?.[0];
      if (!place) {
        res.status(404).json({
          error: `Could not find "${rawLocation}". Try a nearby district or city like Ludhiana, Nashik, Indore, or Jaipur.`,
        });
        return;
      }

      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=precipitation_sum&past_days=14&forecast_days=7&timezone=auto`;
      const wxRes = await fetch(forecastUrl);
      if (!wxRes.ok) {
        throw new Error(`Weather forecast service responded with ${wxRes.status}`);
      }

      const wxData = (await wxRes.json()) as {
        current?: {
          temperature_2m?: number;
          relative_humidity_2m?: number;
          precipitation?: number;
          weather_code?: number;
        };
        daily?: {
          precipitation_sum?: number[];
        };
      };

      const temperatureC = Math.round(wxData.current?.temperature_2m ?? 25);
      const humidityPct = Math.round(wxData.current?.relative_humidity_2m ?? 60);
      const precipSums = Array.isArray(wxData.daily?.precipitation_sum)
        ? wxData.daily.precipitation_sum
        : [];
      const rainfallMm = estimateMonthlyRainfallMm(
        precipSums,
        precipSums.length || 21
      );
      const weatherSummary = describeWeatherCode(
        wxData.current?.weather_code ?? 0
      );
      const regionLabel = place.admin1 || place.country || "";
      const soilDefaults = inferRegionalSoilDefaults(regionLabel);

      res.json({
        locationName: place.name,
        admin1: place.admin1 || "",
        country: place.country || "India",
        latitude: place.latitude,
        longitude: place.longitude,
        temperatureC,
        humidityPct,
        rainfallMm,
        weatherSummary,
        soilDefaults,
      });
    } catch (error) {
      console.error("Weather fetch error:", error);
      res.status(502).json({
        error: "Unable to fetch live weather for that location right now. Please try again.",
      });
    }
  });

  function resolveChatModelConfig(mode: ChatMode) {
    if (mode === "fast") {
      return {
        model: "gemini-3.1-flash-lite",
        thinkingLevel: ThinkingLevel.MINIMAL,
      };
    }
    if (mode === "deep") {
      return {
        model: "gemini-4-hydrogen",
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }
    return {
      model: "gemini-4-hydrogen",
      thinkingLevel: ThinkingLevel.LOW,
    };
  }

  function sanitizeChatRequest(body: {
    messages?: IncomingMessage[];
    mode?: ChatMode;
    language?: string;
  }) {
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const mode: ChatMode =
      body?.mode === "fast" || body?.mode === "deep" ? body.mode : "balanced";
    const requestedLanguage =
      typeof body?.language === "string" && body.language.trim()
        ? body.language.trim().slice(0, 40)
        : "English";

    const sanitized = messages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "model") &&
          typeof m.text === "string" &&
          m.text.trim().length > 0
      )
      .slice(-14)
      .map((m) => ({
        role: m.role,
        text: m.text.trim().slice(0, 2000),
      }));

    return { sanitized, mode, requestedLanguage };
  }

  app.post("/api/chat/stream", limitApi, async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            "Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.",
        });
        return;
      }

      const { sanitized, mode, requestedLanguage } = sanitizeChatRequest(
        req.body as {
          messages?: IncomingMessage[];
          mode?: ChatMode;
          language?: string;
        }
      );

      if (sanitized.length === 0) {
        res.status(400).json({ error: "Please enter a message before sending." });
        return;
      }

      const lastMessage = sanitized[sanitized.length - 1];
      if (lastMessage.role !== "user") {
        res.status(400).json({ error: "Latest message must be from the user." });
        return;
      }

      const history = sanitized.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text.trim() }],
      }));

      const { model, thinkingLevel } = resolveChatModelConfig(mode);
      const languageHint =
        requestedLanguage.toLowerCase() === "english"
          ? ""
          : `\n4. Preferred Response Language: Respond clearly and naturally in ${requestedLanguage} unless the farmer specifically asks for another language.`;

      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      const chat = ai.chats.create({
        model,
        history,
        config: {
          systemInstruction: `${SYSTEM_INSTRUCTION}${languageHint}`,
          thinkingConfig: {
            thinkingLevel,
          },
        },
      });

      const streamResult = await chat.sendMessageStream({
        message: lastMessage.text.trim(),
      });

      let fullText = "";
      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const text = c.text ?? "";
        if (text) {
          fullText += text;
          res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        }
      }

      if (!fullText.trim()) {
        res.write(
          `data: ${JSON.stringify({
            chunk:
              "I could not generate a response right now. Please try asking again in simpler words.",
          })}\n\n`
        );
      }

      res.write(
        `data: ${JSON.stringify({ done: true, modelUsed: model, mode })}\n\n`
      );
      res.end();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to reach Gemini AI.";
      console.error("Gemini chat stream error:", error);

      let userError = "Unable to get an AI response right now. Please try again.";
      if (message.includes("403") || message.includes("API_KEY_INVALID")) {
        userError =
          "Gemini API key was rejected. Please verify GEMINI_API_KEY in Settings > Secrets.";
      } else if (
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED")
      ) {
        userError =
          "AI quota limit reached temporarily. Please wait a moment or try Fast mode.";
      }

      if (!res.headersSent) {
        res.status(500).json({ error: userError });
      } else {
        res.write(`data: ${JSON.stringify({ error: userError })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/chat", limitApi, async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            "Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.",
        });
        return;
      }

      const { sanitized, mode, requestedLanguage } = sanitizeChatRequest(
        req.body as {
          messages?: IncomingMessage[];
          mode?: ChatMode;
          language?: string;
        }
      );

      if (sanitized.length === 0) {
        res.status(400).json({ error: "Please enter a message before sending." });
        return;
      }

      const lastMessage = sanitized[sanitized.length - 1];
      if (lastMessage.role !== "user") {
        res.status(400).json({ error: "Latest message must be from the user." });
        return;
      }

      const history = sanitized.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text.trim() }],
      }));

      const { model, thinkingLevel } = resolveChatModelConfig(mode);

      const languageHint =
        requestedLanguage.toLowerCase() === "english"
          ? ""
          : `\n4. Preferred Response Language: Respond clearly and naturally in ${requestedLanguage} unless the farmer specifically asks for another language.`;

      const chat = ai.chats.create({
        model,
        history,
        config: {
          systemInstruction: `${SYSTEM_INSTRUCTION}${languageHint}`,
          thinkingConfig: {
            thinkingLevel,
          },
        },
      });

      const response = await chat.sendMessage({
        message: lastMessage.text.trim(),
      });

      const replyText =
        response.text?.trim() ||
        "I could not generate a response right now. Please try asking again in simpler words.";

      res.json({
        reply: replyText,
        modelUsed: model,
        mode,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to reach Gemini AI.";
      console.error("Gemini chat error:", error);

      if (message.includes("403") || message.includes("API_KEY_INVALID")) {
        res.status(403).json({
          error:
            "Gemini API key was rejected. Please verify GEMINI_API_KEY in Settings > Secrets.",
        });
        return;
      }

      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
        res.status(429).json({
          error:
            "AI quota limit reached temporarily. Please wait a moment or try Fast mode.",
        });
        return;
      }

      res.status(500).json({
        error: "Unable to get an AI response right now. Please try again.",
      });
    }
  });

  app.post("/api/admin/send-employee-access-email", limitApi, async (req, res) => {
    try {
      const body = req.body as {
        employeeName?: unknown;
        employeeEmail?: unknown;
        tempPassword?: unknown;
        department?: unknown;
        portalUrl?: unknown;
        previewOnly?: unknown;
      };

      if (
        typeof body?.employeeName !== "string" ||
        typeof body?.employeeEmail !== "string" ||
        typeof body?.tempPassword !== "string"
      ) {
        res.status(400).json({
          error: "Employee name, email, and one-time password are required.",
        });
        return;
      }

      const employeeName = stripEmailHeaderInjection(body.employeeName).slice(
        0,
        100
      );
      const employeeEmail = stripEmailHeaderInjection(body.employeeEmail)
        .toLowerCase()
        .slice(0, 160);
      const department =
        typeof body.department === "string"
          ? stripEmailHeaderInjection(body.department).slice(0, 80)
          : undefined;
      const fallbackPortal =
        process.env.APP_URL && process.env.APP_URL !== "MY_APP_URL"
          ? process.env.APP_URL
          : "https://bhoomibandhu.in";
      const portalUrl = sanitizePortalUrl(body.portalUrl, fallbackPortal);

      const check = validateEmployeeProvisionInput({
        name: employeeName,
        email: employeeEmail,
        tempPassword: body.tempPassword,
        department,
      });
      if (!check.valid) {
        res.status(400).json({ error: check.error || "Invalid employee input." });
        return;
      }

      const emailPayload = buildNoReplyAccessEmail({
        employeeName,
        employeeEmail,
        tempPassword: body.tempPassword,
        department,
        portalUrl,
      });

      const smtpConfigured = Boolean(
        process.env.SMTP_HOST &&
          process.env.SMTP_USER &&
          process.env.SMTP_PASS
      );
      const previewOnly = body.previewOnly === true;

      if (smtpConfigured && !previewOnly) {
        const verified = await verifyAdminBearerToken(
          req.headers.authorization
        );
        if (!verified.ok) {
          res.status(403).json({
            error:
              "Verified Administrator authorization is required to dispatch live emails.",
          });
          return;
        }

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const fromAddress =
          process.env.SMTP_FROM || emailPayload.fromAddress;

        const info = await transporter.sendMail({
          from: fromAddress,
          replyTo: emailPayload.replyTo,
          to: emailPayload.toEmail,
          subject: emailPayload.subject,
          text: emailPayload.bodyText,
        });

        res.json({
          ok: true,
          deliveryMode: "smtp",
          messageId: info.messageId || `smtp-${Date.now()}`,
          emailRecord: {
            ...emailPayload,
            fromAddress,
          },
        });
        return;
      }

      res.json({
        ok: true,
        deliveryMode: "outbox_generated",
        messageId: `noreply-${Date.now()}`,
        emailRecord: emailPayload,
      });
    } catch (error) {
      console.error("Employee access email generation error:", error);
      res.status(500).json({
        error: "Unable to generate automated no-reply access email.",
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BhoomiBandhu server running at http://localhost:${PORT}`);
  });
}

startServer();
