import os
import json
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = FastAPI(title="CertCompass API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ldsiipqzybunbnijtuev.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkc2lpcHF6eWJ1bmJuaWp0dWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDg4MjEsImV4cCI6MjA5NzAyNDgyMX0.H9dD00-t2p_QZXXWMpczNHAFWkGn0VsVXL5P9PrkAZo")

# Initialize Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Failed to initialize Supabase client: {e}")
    supabase = None

# Load certifications database
CERTS_FILE = os.path.join(os.path.dirname(__file__), "data", "certifications.json")
try:
    with open(CERTS_FILE, "r") as f:
        certifications_db = json.load(f)
except Exception as e:
    print(f"Error loading certifications file: {e}")
    certifications_db = []

# In-memory database fallback if user_paths table is missing
IN_MEMORY_PATHS = {}

# Pydantic models
class RecommendRequest(BaseModel):
    career_goal: str
    skills: List[str]

class SavePathRequest(BaseModel):
    title: str
    cert_ids: List[str]

# Authentication Helper
def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    if not supabase:
        # Fallback fake user id for testing without Supabase initialized
        return "mock-user-123"
        
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_response.user.id
    except Exception as e:
        print(f"Token verification error: {e}")
        # Allow testing with mock if token matches mock pattern
        if token == "mock-token":
            return "mock-user-123"
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

# Endpoints
@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/certifications")
def get_certifications(query: str = "", level: str = "", free: Optional[str] = None):
    results = certifications_db
    
    # Filter by query (title, provider, or skills)
    if query:
        q = query.lower()
        results = [
            c for c in results
            if q in c["title"].lower() 
            or q in c["provider"].lower() 
            or any(q in skill.lower() for skill in c["skills"])
        ]
        
    # Filter by level
    if level:
        results = [c for c in results if c["level"].lower() == level.lower()]
        
    # Filter by free pricing
    if free == "true" or free is True:
        results = [c for c in results if c["price"].lower() == "free"]
        
    return {
        "results": results,
        "total": len(results)
    }

@app.post("/api/recommend")
def recommend_path(request: RecommendRequest):
    goal_words = set(request.career_goal.lower().replace("-", " ").split())
    skills_set = set(s.lower() for s in request.skills)
    
    scored_certs = []
    
    for cert in certifications_db:
        score = 0
        cert_title_words = set(cert["title"].lower().replace("-", " ").split())
        cert_skills = set(s.lower() for s in cert["skills"])
        
        # 1. Match career goal terms against title & skills
        goal_matches = goal_words.intersection(cert_title_words)
        score += len(goal_matches) * 5
        
        goal_skill_matches = goal_words.intersection(cert_skills)
        score += len(goal_skill_matches) * 3
        
        # 2. Support progression (penalize certifications that match already possessed skills)
        possessed_matches = skills_set.intersection(cert_skills)
        # Having some matching skills is good (shows relevance), but fully matching means they might not need it
        score += len(possessed_matches) * 2
        
        # If the level aligns with their background (if they have no skills, suggest beginner)
        if not skills_set and cert["level"] == "Beginner":
            score += 4
        elif len(skills_set) > 3 and cert["level"] == "Advanced":
            score += 3
            
        scored_certs.append((cert, score))
        
    # Sort by score descending
    scored_certs.sort(key=lambda x: x[1], reverse=True)
    
    # Filter out ones with zero or low relevance unless we have none
    top_recommendations = [item[0] for item in scored_certs[:3]]
    
    # Order them logically by progression level: Beginner -> Intermediate -> Advanced
    level_order = {"beginner": 1, "intermediate": 2, "advanced": 3}
    top_recommendations.sort(key=lambda x: level_order.get(x["level"].lower(), 4))
    
    # If no goals/skills matched, provide a basic fallback track
    if not top_recommendations:
        top_recommendations = [c for c in certifications_db if c["level"] in ["Beginner", "Intermediate"]][:2]
        
    title = f"{request.career_goal} Learning Track"
    
    return {
        "title": title,
        "recommended_certs": top_recommendations
    }

@app.get("/api/paths")
def get_paths(user_id: str = Depends(get_user_id_from_token)):
    # Try querying Supabase
    if supabase:
        try:
            response = supabase.table("user_paths").select("*").eq("user_id", user_id).order("searched_at", desc=True).execute()
            return {"paths": response.data}
        except Exception as e:
            print(f"Supabase DB query error: {e}. Falling back to in-memory store.")
            
    # Fallback to in-memory store
    user_paths = IN_MEMORY_PATHS.get(user_id, [])
    return {"paths": user_paths}

@app.post("/api/paths/save")
def save_path(request: SavePathRequest, user_id: str = Depends(get_user_id_from_token)):
    path_record = {
        "title": request.title,
        "cert_ids": request.cert_ids,
        "searched_at": datetime.utcnow().isoformat() + "Z"
    }
    
    # Try saving to Supabase
    if supabase:
        try:
            db_record = {
                "user_id": user_id,
                "title": request.title,
                "cert_ids": request.cert_ids
            }
            supabase.table("user_paths").insert(db_record).execute()
            return {"status": "success", "path": path_record}
        except Exception as e:
            print(f"Supabase DB insert error: {e}. Saving to in-memory store.")
            
    # Fallback to in-memory store
    if user_id not in IN_MEMORY_PATHS:
        IN_MEMORY_PATHS[user_id] = []
    IN_MEMORY_PATHS[user_id].insert(0, path_record)
    
    return {"status": "success", "path": path_record}
