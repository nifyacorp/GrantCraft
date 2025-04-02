import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendUrl) {
      return res.status(500).json({ 
        error: "NEXT_PUBLIC_BACKEND_URL is not configured"
      });
    }
    
    // Check backend health
    const response = await axios.get(`${backendUrl}/api/debug/health`, {
      timeout: 5000 // 5 second timeout
    });
    
    return res.status(200).json({
      frontend: {
        status: "ok",
        timestamp: new Date().toISOString()
      },
      backend: response.data,
      connection: "ok"
    });
  } catch (error) {
    console.error("Backend status check failed:", error);
    
    return res.status(200).json({
      frontend: {
        status: "ok",
        timestamp: new Date().toISOString()
      },
      backend: {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      connection: "failed"
    });
  }
}