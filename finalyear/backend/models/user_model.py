from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class Education(BaseModel):
    tenth: Optional[str] = None
    twelfth: Optional[str] = None
    graduation: Optional[str] = None
    post_graduation: Optional[str] = None
    status: Optional[str] = None # pursuing/completed

class Experience(BaseModel):
    level: Optional[str] = "Fresher" # Fresher / Experienced
    years: Optional[float] = 0.0
    current_role: Optional[str] = None
    company: Optional[str] = None

class Project(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: List[str] = []
    link: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    about_me: Optional[str] = None
    education: Optional[Education] = None
    skills: Optional[List[str]] = None
    experience: Optional[Experience] = None
    resume_url: Optional[str] = None
    projects: Optional[List[Project]] = None

class UserResponse(UserBase):
    about_me: Optional[str] = None
    education: Optional[Education] = None
    skills: List[str] = []
    experience: Optional[Experience] = None
    projects: List[Project] = []
    resume_url: Optional[str] = None
    best_career_match: Optional[str] = None
    career_match_score: Optional[float] = None
