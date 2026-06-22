"""
Dataset Generation Script for CareerPulse AI.
This script expands the existing mock datasets into large-scale, realistic
datasets focused on the Indian Job Market and the Creator Economy.

Run this script to generate new CSV files in the dataset folder.
"""
import csv
import os
import random

# Base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_indian_jobs(num_records=500):
    print("Generating Indian Jobs dataset...")
    companies = [
        "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Capgemini", "Deloitte", 
        "Tech Mahindra", "Jio", "HCL", "Zoho", "Razorpay", "Zerodha", "Swiggy", 
        "Zomato", "PhonePe", "Flipkart", "Meesho", "Freshworks", "CRED", "Nykaa",
        "Google India", "Microsoft India", "Amazon India", "Sarvam AI", "Krutrim"
    ]
    roles = [
        "Software Engineer", "Frontend Developer", "Backend Developer", 
        "Full Stack Developer", "Data Scientist", "Data Analyst", 
        "ML Engineer", "AI Engineer", "DevOps Engineer", "Cloud Engineer", 
        "Cybersecurity Analyst", "UI/UX Designer", "Product Manager",
        "Blockchain Developer", "Prompt Engineer"
    ]
    locations = ["Bangalore", "Mumbai", "Delhi/NCR", "Hyderabad", "Pune", "Chennai", "Remote"]
    
    file_path = os.path.join(BASE_DIR, "indian_jobs.csv")
    
    with open(file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "company", "title", "skills_required", "min_salary_lpa", "max_salary_lpa",
            "experience_level", "location", "work_mode", "industry", "growth_rate",
            "future_demand_score", "hiring_trend"
        ])
        
        for _ in range(num_records):
            comp = random.choice(companies)
            role = random.choice(roles)
            loc = random.choice(locations)
            mode = "Remote" if loc == "Remote" else random.choice(["Onsite", "Hybrid", "Hybrid"])
            
            # Simple logic for salaries based on role & company
            base_min = random.randint(3, 15)
            if "AI" in role or "ML" in role or "Product" in role:
                base_min += 5
            if comp in ["Google India", "Microsoft India", "Amazon India", "Razorpay", "Zerodha"]:
                base_min += 8
                
            base_max = base_min + random.randint(3, 15)
            
            exp = random.choice(["Entry Level", "1-3 Years", "3-5 Years", "5-8 Years", "8+ Years"])
            if exp == "Entry Level":
                base_min = max(3, base_min - 3)
                base_max = max(5, base_min + 3)
                
            growth = f"+{random.randint(15, 60)}%"
            demand = random.randint(70, 99)
            trend = random.choice(["High", "Very High", "Explosive", "Stable"])
            
            # Generic skills based on role (just placeholders, real logic would be better)
            skills = "Python,SQL,React" if "Developer" in role else "Python,Machine Learning"
            
            writer.writerow([
                comp, role, skills, base_min, base_max, exp, loc, mode, 
                "IT/Tech", growth, demand, trend
            ])
            
    print(f"Generated indian_jobs.csv with {num_records} rows.")


def generate_skills():
    print("Expanding skills database...")
    file_path = os.path.join(BASE_DIR, "skills.csv")
    
    # We will just append new high-demand skills to existing skills
    new_skills = [
        {"name": "Prompt Engineering", "category": "AI", "difficulty": "Intermediate"},
        {"name": "LangChain", "category": "AI", "difficulty": "Advanced"},
        {"name": "Generative AI", "category": "AI", "difficulty": "Advanced"},
        {"name": "Large Language Models", "category": "AI", "difficulty": "Advanced"},
        {"name": "RAG", "category": "AI", "difficulty": "Advanced"},
        {"name": "Hugging Face", "category": "AI", "difficulty": "Intermediate"},
        {"name": "Video Editing", "category": "Creator", "difficulty": "Intermediate"},
        {"name": "Thumbnail Design", "category": "Creator", "difficulty": "Beginner"},
        {"name": "Storytelling", "category": "Soft Skills", "difficulty": "Intermediate"},
        {"name": "Bubble", "category": "No-Code", "difficulty": "Intermediate"},
        {"name": "Webflow", "category": "No-Code", "difficulty": "Intermediate"},
        {"name": "Zapier", "category": "Automation", "difficulty": "Beginner"},
        {"name": "Financial Modeling", "category": "Finance", "difficulty": "Advanced"},
        {"name": "Solidity", "category": "Web3", "difficulty": "Advanced"},
        {"name": "Smart Contracts", "category": "Web3", "difficulty": "Advanced"}
    ]
    
    # Read existing
    existing = set()
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing.add(row["skill_name"].lower())
                
    # Append
    with open(file_path, "a", newline="", encoding="utf-8") as f:
        # If file is empty, write header
        if not existing:
            writer = csv.writer(f)
            writer.writerow(["skill_name", "category", "difficulty"])
        else:
            writer = csv.writer(f)
            
        count = 0
        for s in new_skills:
            if s["name"].lower() not in existing:
                writer.writerow([s["name"], s["category"], s["difficulty"]])
                count += 1
                
    print(f"Appended {count} new skills to skills.csv")


if __name__ == "__main__":
    print("Starting dataset generation...")
    generate_indian_jobs(500)
    generate_skills()
    print("Dataset generation complete!")
