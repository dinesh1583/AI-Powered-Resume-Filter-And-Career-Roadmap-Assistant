import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.nlp_service import extract_skills_from_text

text = "I have a lot of go, and I react to things quickly. I want to express my feelings."
print("Should be empty or basic:", extract_skills_from_text(text))

text2 = "I am a Go developer with experience in React and Express.js."
print("Should have Go, React, Express:", extract_skills_from_text(text2))

text3 = "I use agile methodologies."
print("Should have nothing (agile is lower):", extract_skills_from_text(text3))

text4 = "Experienced in Agile and Scrum."
print("Should have Agile and Scrum:", extract_skills_from_text(text4))
