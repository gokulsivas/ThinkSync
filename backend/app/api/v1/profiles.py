from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import os

router = APIRouter()

class SocialLinks(BaseModel):
    orcid: Optional[str] = None
    googleScholar: Optional[str] = None
    linkedIn: Optional[str] = None
    github: Optional[str] = None

class Publication(BaseModel):
    id: str
    title: str
    doi: str
    url: Optional[str] = None
    datePublished: Optional[str] = None

class ProfileUpdate(BaseModel):
    name: str
    title: str
    affiliation: str
    hIndex: Optional[int] = None
    researchInterests: List[str]
    awards: List[str]
    publications: List[Publication]
    socialLinks: SocialLinks
    isPublic: bool

# Simple file-based storage
PROFILES_FILE = "profiles.json"

def load_profiles():
    if os.path.exists(PROFILES_FILE):
        with open(PROFILES_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_profiles(profiles):
    with open(PROFILES_FILE, 'w') as f:
        json.dump(profiles, f, indent=2)

@router.get("/profiles/{user_id}")
async def get_profile(user_id: str):
    profiles = load_profiles()
    
    if user_id in profiles:
        return profiles[user_id]
    
    # Return mock profile data for testing
    if user_id == "user-123":
        return {
            "id": "user-123",
            "name": "Test User",
            "title": "Researcher",
            "affiliation": "Test University",
            "hIndex": None,
            "researchInterests": ["AI", "Machine Learning"],
            "awards": ["Best Paper 2023"],
            "publications": [],
            "socialLinks": {
                "orcid": None,
                "googleScholar": None,
                "linkedIn": None,
                "github": None,
            },
            "isPublic": True,
        }
    
    raise HTTPException(status_code=404, detail="Profile not found")

@router.put("/profiles/{user_id}")
async def update_profile(user_id: str, profile_data: ProfileUpdate):
    try:
        profiles = load_profiles()
        
        # Create the updated profile
        updated_profile = {
            "id": user_id,
            "name": profile_data.name,
            "title": profile_data.title,
            "affiliation": profile_data.affiliation,
            "hIndex": profile_data.hIndex,
            "researchInterests": profile_data.researchInterests,
            "awards": profile_data.awards,
            "publications": [pub.dict() for pub in profile_data.publications],
            "socialLinks": profile_data.socialLinks.dict(),
            "isPublic": profile_data.isPublic,
        }
        
        # Save the profile
        profiles[user_id] = updated_profile
        save_profiles(profiles)
        
        return {"message": "Profile updated successfully", "profile": updated_profile}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")