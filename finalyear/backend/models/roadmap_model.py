from pydantic import BaseModel, Field
from typing import List, Optional

class Resource(BaseModel):
    title: str
    type: str # course, project, video, article
    link: str

class Step(BaseModel):
    id: str
    title: str
    description: str
    skills: List[str] = []
    resources: List[Resource] = []
    is_completed: bool = False

class Roadmap(BaseModel):
    user_email: str
    target_career: str
    match_percentage: float
    difficulty: str = "Intermediate"
    steps: List[Step] = []

class StepUpdate(BaseModel):
    step_id: str
    is_completed: bool
