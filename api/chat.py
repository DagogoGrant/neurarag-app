import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    model: str = "gemini-1.5-flash"
    geminiApiKey: str = ""

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "NeuraRAG Python Backend is running!"}

@app.post("/api/chat")
async def chat(req: ChatRequest):
    try:
        # Enforce Bring Your Own Key (BYOK) architecture
        api_key = req.geminiApiKey
        if not api_key:
            return {"text": "### Please Provide Your API Key\n\nThe site owner has enforced a Bring Your Own Key architecture.\n\nPlease go to the **Settings** tab on the left sidebar and enter your Google Gemini API Key to continue.", "thought": "API Key missing. Instructed user to provide key.", "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0}, "sources": [], "timeline": []}
            
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.7,
            google_api_key=api_key
        )
        
        messages = [
            SystemMessage(content="You are NeuraRAG, an advanced AI assistant. Provide concise, professional answers."),
            HumanMessage(content=req.message)
        ]
        
        response = await llm.ainvoke(messages)
        return {
            "text": response.content,
            "thought": f"Processed successfully by {req.model} via LangChain RAG pipeline.",
            "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
            "sources": [],
            "timeline": []
        }
        
    except Exception as e:
        return {
            "text": f"An error occurred in the AI engine: {str(e)}",
            "thought": "Execution failed.",
            "tokensUsed": {"prompt": 0, "completion": 0, "cost": 0},
            "sources": [],
            "timeline": []
        }
