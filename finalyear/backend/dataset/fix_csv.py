import os

file_path = r"c:\Users\Dell\OneDrive\Desktop\finalyear\backend\dataset\passion_careers.csv"

# Read the valid lines
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

valid_lines = []
for line in lines:
    if line.startswith("p") and not line.startswith("p 3"):
        valid_lines.append(line.strip())

# The last valid line should be p30
new_entries = [
    'p31,Content Creation,Creative Arts,YouTuber / Video Creator,"Build your own channel, create entertaining or educational videos, and monetize your content.",Very High,40%,"Video Editing, Storytelling, SEO, Audience Engagement, Scriptwriting, YouTube Analytics, Thumbnail Design","Step 1: Choose Your Niche (2 weeks) — Decide on gaming, tech, lifestyle, or education|Step 2: Setup Gear & Software (2 weeks) — Camera, mic, lighting, OBS, Premiere Pro|Step 3: Script & Storyboard (3 weeks) — Write engaging hooks, structure videos|Step 4: Record & Edit (4 weeks) — Practice on-camera presence, learn pacing|Step 5: Master SEO & Thumbnails (3 weeks) — Keywords, click-through rates, CTR optimization|Step 6: Consistency & Growth (ongoing) — Upload weekly, engage with comments, analyze retention","YouTube Creator Academy|Think Media YouTube Channel|Skillshare Video Production"',
    'p32,Gaming,Technology,Pro Gamer / Streamer,"Turn your gaming skills into a career by competing in esports or streaming on Twitch/YouTube.",High,35%,"Gaming Strategy, Commentary, Community Building, OBS Studio, Networking, Entertainment","Step 1: Pick a Main Game (4 weeks) — Focus on a popular competitive or entertaining game|Step 2: Stream Setup (2 weeks) — PC optimization, OBS setup, overlays, alerts|Step 3: Develop Persona (3 weeks) — Decide your stream vibe, practice commentary|Step 4: Build a Schedule (1 week) — Stream consistently on set days|Step 5: Cross-Platform Growth (4 weeks) — Post clips to TikTok, YouTube Shorts, Reels|Step 6: Network & Monetize (ongoing) — Collaborate with streamers, get sponsorships, join orgs","Twitch Creator Camp|Harris Heller Alpha Gaming|Esports Training Platforms"',
    'p33,Social Media,Lifestyle,Instagram Influencer / Creator,"Build a massive following by sharing lifestyle, fashion, or niche content and partnering with brands.",Very High,45%,"Personal Branding, Photography, Short-Form Video, Social Media Marketing, Brand Negotiation, Networking","Step 1: Define Personal Brand (2 weeks) — Niche, aesthetics, unique value proposition|Step 2: Content Strategy (3 weeks) — Plan Reels, Stories, Carousels|Step 3: Learn Mobile Editing (2 weeks) — CapCut, Lightroom Mobile, trending audio|Step 4: Post & Analyze (4 weeks) — Post daily, study Instagram Insights, adapt|Step 5: Build Community (ongoing) — Reply to DMs, host Q&As, go live|Step 6: Brand Deals (ongoing) — Create a media kit, pitch to brands, monetize","Instagram Creators Portal|Social Media Examiner|Skillshare Personal Branding"'
]

with open(file_path, "w", encoding="utf-8") as f:
    for line in valid_lines:
        if line:
            f.write(line + "\n")
    for entry in new_entries:
        f.write(entry + "\n")

print("Fixed passion_careers.csv")
