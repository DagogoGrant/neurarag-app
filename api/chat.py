import os
import json
import urllib.request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from duckduckgo_search import DDGS

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

class AttachedFile(BaseModel):
    mimeType: str
    data: str
    name: str

class ChatRequest(BaseModel):
    message: str
    model: str = "gemini-1.5-flash"
    geminiApiKey: str = ""
    history: Optional[List[ChatMessage]] = []
    attachedFiles: Optional[List[AttachedFile]] = []
    webSearchEnabled: bool = False

class ProxyTestRequest(BaseModel):
    baseUrl: str
    apiKey: str

class ProxyChatRequest(BaseModel):
    baseUrl: str
    apiKey: str
    model: str
    messages: List[Dict[str, Any]]
    temperature: float = 0.2

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
            
        # If there are attached files, inject them into the last user message's parts for multimodal processing
        if req.attachedFiles and contents:
            file_parts = []
            for file in req.attachedFiles:
                # Gemini native inlineData schema
                file_parts.append({
                    "inlineData": {
                        "mimeType": file.mimeType,
                        "data": file.data
                    }
                })
            # Prepend files before the text query
            contents[-1]["parts"] = file_parts + contents[-1]["parts"]
            
        # Optional: Automated Web Research Agent Step
        web_sources = []
        web_timeline = []
        if req.webSearchEnabled:
            try:
                with DDGS() as ddgs:
                    results = list(ddgs.text(req.message, max_results=3))
                    if results:
                        context_str = "Live Web Context:\n"
                        for i, r in enumerate(results):
                            context_str += f"{i+1}. {r['title']} ({r['href']}): {r['body']}\n"
                            web_sources.append({
                                "id": f"web-{i}",
                                "title": r['title'],
                                "type": "doc",
                                "confidence": 0.95,
                                "snippet": r['body']
                            })
                        
                        web_timeline.append({
                            "id": f"web-ev-{len(web_timeline)}",
                            "timestamp": "now", # Placeholder, frontend ignores this anyway if we don't strictly format it
                            "agentId": "retriever",
                            "title": "Web Research Agent",
                            "detail": f"Scraped {len(results)} live internet sources via DuckDuckGo.",
                            "status": "success"
                        })
                        
                        # Inject live context into user's latest message
                        contents[-1]["parts"].insert(0, {"text": context_str + "\n\nUser Query: "})
            except Exception as e:
                web_timeline.append({
                    "id": f"web-ev-err",
                    "timestamp": "now",
                    "agentId": "retriever",
                    "title": "Web Research Agent Failed",
                    "detail": str(e),
                    "status": "error"
                })

        payload = {
            "systemInstruction": {
                "parts": [{"text": "You are NeuraRAG, an advanced AI assistant. Provide concise, professional answers formatted in Markdown. If live web context is provided in the prompt, use it to accurately answer the question."}]
            },
            "contents": contents
        }
        
        data = json.dumps(payload).encode('utf-8')
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{req.model}:generateContent?key={api_key}"
        
        req_obj = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        
        try:
            with urllib.request.urlopen(req_obj) as response:
                res_json = json.loads(response.read())
                
                try:
                    reply_text = res_json['candidates'][0]['content']['parts'][0]['text']
                except (KeyError, IndexError):
                    reply_text = "Received an empty or malformed response from Google Gemini."
                    
                thought_msg = f"Processed successfully by {req.model} via direct REST pipeline."
                if req.webSearchEnabled:
                    thought_msg += f" Web research was successful, grounding answer in {len(web_sources)} live websites."
                elif req.attachedFiles:
                    thought_msg += f" Received {len(req.attachedFiles)} attached file(s) for multimodal context."
                    
                return {
                    "text": reply_text,
                    "thought": thought_msg,
                    "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
                    "sources": web_sources,
                    "timeline": web_timeline
                }
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8')
            return {
                "text": f"### Google Gemini API Error\n\nGoogle rejected your API key or request. \n\n**Error {e.code}**: {e.reason}\n\n```json\n{err_msg}\n```",
                "thought": "Execution failed due to API error.",
                "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
                "sources": [],
                "timeline": web_timeline
            }
            
    except Exception as e:
        return {
            "text": f"An error occurred in the Python backend: {str(e)}",
            "thought": "Execution failed.",
            "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
            "sources": [],
            "timeline": []
        }

@app.post("/api/proxy/test")
def proxy_test(req: ProxyTestRequest):
    try:
        base_url = req.baseUrl.rstrip('/')
        url = f"{base_url}/models"
        req_obj = urllib.request.Request(url, headers={
            'Authorization': f'Bearer {req.apiKey}',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }, method='GET')
        with urllib.request.urlopen(req_obj) as response:
            payload = json.loads(response.read())
            return {"status": "success", "data": payload}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        return {"status": "error", "message": f"HTTP {e.code}: {err_msg}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/proxy/chat")
def proxy_chat(req: ProxyChatRequest):
    try:
        base_url = req.baseUrl.rstrip('/')
        url = f"{base_url}/chat/completions"
        payload = {
            "model": req.model,
            "messages": req.messages,
            "temperature": req.temperature
        }
        data = json.dumps(payload).encode('utf-8')
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {req.apiKey}',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }
        req_obj = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        with urllib.request.urlopen(req_obj) as response:
            res_json = json.loads(response.read())
            reply_text = res_json.get('choices', [{}])[0].get('message', {}).get('content', "No response content.")
            usage = res_json.get('usage', {})
            return {
                "text": reply_text,
                "thought": f"Processed successfully by custom backend proxy.",
                "tokensUsed": {"prompt": usage.get('prompt_tokens', 0), "completion": usage.get('completion_tokens', 0), "cost": 0},
                "sources": [],
                "timeline": []
            }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        return {
            "text": f"### Proxy API Error\n\nThe custom provider returned an error.\n\n**Error {e.code}**: {e.reason}\n\n```json\n{err_msg}\n```",
            "thought": "Execution failed due to API error.",
            "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
            "sources": [],
            "timeline": []
        }
    except Exception as e:
        return {
            "text": f"An error occurred while proxying: {str(e)}",
            "thought": "Execution failed.",
            "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
            "sources": [],
            "timeline": []
        }
