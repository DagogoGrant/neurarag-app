import os
import json
import urllib.request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    model: str = "gemini-1.5-flash"
    geminiApiKey: str = ""
    history: Optional[List[ChatMessage]] = []

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "NeuraRAG Python Backend is running!"}

@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        # Enforce Bring Your Own Key (BYOK) architecture
        api_key = req.geminiApiKey
        if not api_key:
            return {"text": "### Please Provide Your API Key\n\nThe site owner has enforced a Bring Your Own Key architecture.\n\nPlease go to the **Settings** tab on the left sidebar and enter your Google Gemini API Key to continue.", "thought": "API Key missing. Instructed user to provide key.", "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0}, "sources": [], "timeline": []}
            
        # Build contents array mapping roles
        contents = []
        for msg in req.history:
            role = "model" if msg.role == "assistant" else "user"
            contents.append({
                "role": role,
                "parts": [{"text": msg.text}]
            })
            
        # Append current user message if it's not already at the end of history
        if not contents or contents[-1].get("parts")[0].get("text") != req.message:
            contents.append({
                "role": "user",
                "parts": [{"text": req.message}]
            })
            
        payload = {
            "systemInstruction": {
                "parts": [{"text": "You are NeuraRAG, an advanced AI assistant. Provide concise, professional answers formatted in Markdown."}]
            },
            "contents": contents
        }
        
        data = json.dumps(payload).encode('utf-8')
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        req_obj = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        
        try:
            with urllib.request.urlopen(req_obj) as response:
                res_json = json.loads(response.read())
                
                try:
                    reply_text = res_json['candidates'][0]['content']['parts'][0]['text']
                except (KeyError, IndexError):
                    reply_text = "Received an empty or malformed response from Google Gemini."
                    
                return {
                    "text": reply_text,
                    "thought": f"Processed successfully by {req.model} via direct REST pipeline.",
                    "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
                    "sources": [],
                    "timeline": []
                }
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8')
            return {
                "text": f"### Google Gemini API Error\n\nGoogle rejected your API key or request. \n\n**Error {e.code}**: {e.reason}\n\n```json\n{err_msg}\n```",
                "thought": "Execution failed due to API error.",
                "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
                "sources": [],
                "timeline": []
            }
            
    except Exception as e:
        return {
            "text": f"An error occurred in the Python backend: {str(e)}",
            "thought": "Execution failed.",
            "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
            "sources": [],
            "timeline": []
        }
