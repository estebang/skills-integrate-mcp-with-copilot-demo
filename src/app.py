"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import os
from pathlib import Path
import uuid
from datetime import datetime

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities and location-based meetups")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# Pydantic models for meetups
class MeetupCreate(BaseModel):
    name: str
    description: str
    location: str
    schedule: str
    max_participants: int
    category: str  # academic or extra-curricular
    organizer_email: str

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    "Soccer Team": {
        "description": "Join the school soccer team and compete in matches",
        "schedule": "Tuesdays and Thursdays, 4:00 PM - 5:30 PM",
        "max_participants": 22,
        "participants": ["liam@mergington.edu", "noah@mergington.edu"]
    },
    "Basketball Team": {
        "description": "Practice and play basketball with the school team",
        "schedule": "Wednesdays and Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 15,
        "participants": ["ava@mergington.edu", "mia@mergington.edu"]
    },
    "Art Club": {
        "description": "Explore your creativity through painting and drawing",
        "schedule": "Thursdays, 3:30 PM - 5:00 PM",
        "max_participants": 15,
        "participants": ["amelia@mergington.edu", "harper@mergington.edu"]
    },
    "Drama Club": {
        "description": "Act, direct, and produce plays and performances",
        "schedule": "Mondays and Wednesdays, 4:00 PM - 5:30 PM",
        "max_participants": 20,
        "participants": ["ella@mergington.edu", "scarlett@mergington.edu"]
    },
    "Math Club": {
        "description": "Solve challenging problems and participate in math competitions",
        "schedule": "Tuesdays, 3:30 PM - 4:30 PM",
        "max_participants": 10,
        "participants": ["james@mergington.edu", "benjamin@mergington.edu"]
    },
    "Debate Team": {
        "description": "Develop public speaking and argumentation skills",
        "schedule": "Fridays, 4:00 PM - 5:30 PM",
        "max_participants": 12,
        "participants": ["charlotte@mergington.edu", "henry@mergington.edu"]
    }
}

# In-memory meetups database
meetups = {
    "meetup_001": {
        "name": "Study Group - Calculus",
        "description": "Weekly calculus study sessions for advanced students",
        "location": "San Francisco",
        "schedule": "Saturdays, 2:00 PM - 4:00 PM",
        "max_participants": 8,
        "category": "academic",
        "organizer_email": "sarah@mergington.edu",
        "participants": ["sarah@mergington.edu", "alex@mergington.edu"],
        "created_at": "2024-01-15T10:00:00"
    },
    "meetup_002": {
        "name": "Photography Walk",
        "description": "Explore local landmarks and practice photography techniques",
        "location": "Oakland",
        "schedule": "Sundays, 10:00 AM - 12:00 PM",
        "max_participants": 12,
        "category": "extra-curricular",
        "organizer_email": "mike@mergington.edu",
        "participants": ["mike@mergington.edu"],
        "created_at": "2024-01-20T15:30:00"
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Validate student is not already signed up
    if email in activity["participants"]:
        raise HTTPException(
            status_code=400,
            detail="Student is already signed up"
        )

    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}


@app.delete("/activities/{activity_name}/unregister")
def unregister_from_activity(activity_name: str, email: str):
    """Unregister a student from an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Validate student is signed up
    if email not in activity["participants"]:
        raise HTTPException(
            status_code=400,
            detail="Student is not signed up for this activity"
        )

    # Remove student
    activity["participants"].remove(email)
    return {"message": f"Unregistered {email} from {activity_name}"}


# Meetup endpoints
@app.get("/meetups")
def get_meetups(location: str = None):
    """Get all meetups, optionally filtered by location"""
    if location:
        filtered_meetups = {
            meetup_id: meetup_data 
            for meetup_id, meetup_data in meetups.items()
            if meetup_data["location"].lower() == location.lower()
        }
        return filtered_meetups
    return meetups


@app.post("/meetups")
def create_meetup(meetup: MeetupCreate):
    """Create a new meetup"""
    # Generate unique ID
    meetup_id = f"meetup_{str(uuid.uuid4())[:8]}"
    
    # Create meetup data
    meetup_data = {
        "name": meetup.name,
        "description": meetup.description,
        "location": meetup.location,
        "schedule": meetup.schedule,
        "max_participants": meetup.max_participants,
        "category": meetup.category,
        "organizer_email": meetup.organizer_email,
        "participants": [meetup.organizer_email],  # Organizer automatically joins
        "created_at": datetime.now().isoformat()
    }
    
    # Add to meetups database
    meetups[meetup_id] = meetup_data
    
    return {"message": f"Created meetup '{meetup.name}'", "meetup_id": meetup_id}


@app.post("/meetups/{meetup_id}/join")
def join_meetup(meetup_id: str, email: str):
    """Join a meetup"""
    # Validate meetup exists
    if meetup_id not in meetups:
        raise HTTPException(status_code=404, detail="Meetup not found")
    
    # Get the specific meetup
    meetup = meetups[meetup_id]
    
    # Validate user is not already joined
    if email in meetup["participants"]:
        raise HTTPException(
            status_code=400,
            detail="User is already part of this meetup"
        )
    
    # Check if meetup is full
    if len(meetup["participants"]) >= meetup["max_participants"]:
        raise HTTPException(
            status_code=400,
            detail="Meetup is full"
        )
    
    # Add user
    meetup["participants"].append(email)
    return {"message": f"Joined meetup '{meetup['name']}'"}


@app.delete("/meetups/{meetup_id}/leave")
def leave_meetup(meetup_id: str, email: str):
    """Leave a meetup"""
    # Validate meetup exists
    if meetup_id not in meetups:
        raise HTTPException(status_code=404, detail="Meetup not found")
    
    # Get the specific meetup
    meetup = meetups[meetup_id]
    
    # Validate user is part of the meetup
    if email not in meetup["participants"]:
        raise HTTPException(
            status_code=400,
            detail="User is not part of this meetup"
        )
    
    # Don't allow organizer to leave their own meetup
    if email == meetup["organizer_email"]:
        raise HTTPException(
            status_code=400,
            detail="Organizer cannot leave their own meetup"
        )
    
    # Remove user
    meetup["participants"].remove(email)
    return {"message": f"Left meetup '{meetup['name']}'"}


@app.delete("/meetups/{meetup_id}")
def delete_meetup(meetup_id: str, email: str):
    """Delete a meetup (only organizer can delete)"""
    # Validate meetup exists
    if meetup_id not in meetups:
        raise HTTPException(status_code=404, detail="Meetup not found")
    
    # Get the specific meetup
    meetup = meetups[meetup_id]
    
    # Validate user is the organizer
    if email != meetup["organizer_email"]:
        raise HTTPException(
            status_code=403,
            detail="Only the organizer can delete this meetup"
        )
    
    # Delete meetup
    meetup_name = meetup["name"]
    del meetups[meetup_id]
    return {"message": f"Deleted meetup '{meetup_name}'"}
