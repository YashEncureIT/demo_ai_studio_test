import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client helper
let aiClient: GoogleGenAI | null = null;
let clientInitAttempted = false;

function getGeminiClient(): GoogleGenAI | null {
  if (clientInitAttempted) return aiClient;
  
  clientInitAttempted = true;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("AAMS SERVER NOTICE: process.env.GEMINI_API_KEY is not configured. The AI Assistant will fall back to smart simulated responses.");
    return null;
  }
  
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log("AAMS SERVER: GoogleGenAI client successfully initialized for server-side telemetry.");
  } catch (error) {
    console.error("AAMS SERVER ERROR: Failed to instantiate GoogleGenAI client:", error);
    aiClient = null;
  }
  return aiClient;
}

// 1. Health check with API key status disclosure (to let the client know if fallback simulation is active)
app.get("/api/health", (req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "healthy",
    hasApiKey: hasKey,
    environmentStatus: process.env.NODE_ENV || "development"
  });
});

// 2. Core Server-side Gemini API Proxy
app.post("/api/chat", async (req: Request, res: Response) => {
  const { prompt, history, assets, role } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    // If no key, return an error block or status with a descriptive code so the client can trigger its realistic local simulator
    return res.json({
      fallback: true,
      text: "Notice: Real-time Gemini API key is missing. Falling back to the AAMS Local Compliance Expert Simulation."
    });
  }

  try {
    // Format the assets catalog to provide as active context to the model
    const serializedAssets = assets && Array.isArray(assets) 
      ? assets.map((a: any) => `Asset ID: ${a.id} | Name: ${a.name} | Type: ${a.type} | Value: $${a.acquisitionValue} | Book Value: $${a.bookValue} | Safe Status: ${a.status} | Location: ${a.location} | Flags: [${a.governanceFlags?.join(", ") || ""}] | Inactive Days: ${a.daysInactive}`).join("\n")
      : "No live assets received in scope.";

    const systemInstruction = `You are the ultimate AAMS Enterprise Governance & AI Compliance Specialist.
You help auditors, finance officers, asset managers, and master data admins optimize their enterprise accounts, audits, and ledgers.
The active portal role of the user asking is: "${role || "Auditor"}".

Here is the current live asset database state of the enterprise:
---
${serializedAssets}
---

Your behavior guidelines:
1. Always be professional, objective, high-integrity, and highly helpful.
2. Directly answer questions about compliance, audit checklists, useful lives, straight-line or double-declining balance depreciation, lease status issues, inactive devices, or how to remediate anomalies.
3. Suggest clear, actionable solutions referencing specific asset tracking numbers (like AST-2026-9041) when talking about items.
4. Keep answers clean, markdown-friendly, concise, and structured. Do NOT output developer jargon or cite raw server files. Use elegant bold names and list items.`;

    // Package previous context of the chat conversation if available
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const outputText = response.text;
    res.json({
      success: true,
      text: outputText
    });
  } catch (error: any) {
    console.error("AAMS SERVER API ERROR (generateContent):", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Internal Server side Gemini API processing error."
    });
  }
});

// 3. Vite development middleware setup OR static files handler
const setupExpress = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AAMS Enterprise Platform server running on http://localhost:${PORT}`);
  });
};

setupExpress();
