# Mergington High School Activities & Community Meetups API

A super simple FastAPI application that allows students to view and sign up for extracurricular activities and create/join location-based community meetups.

## Features

### School Activities
- View all available extracurricular activities
- Sign up for activities  
- Unregister from activities

### Community Meetups
- Create new meetups with location-based organization
- View all meetups with location filtering
- Join/leave meetups
- Academic and extra-curricular categories
- Community-driven event organization

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Run the application:

   ```
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

3. Open your browser and go to:
   - Main application: http://localhost:8000
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

### Activities
| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Sign up for an activity                                             |
| DELETE | `/activities/{activity_name}/unregister?email=student@mergington.edu` | Unregister from an activity                                        |

### Meetups
| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/meetups`                                                        | Get all meetups (optionally filter by location with ?location=City) |
| POST   | `/meetups`                                                        | Create a new meetup                                                 |
| POST   | `/meetups/{meetup_id}/join?email=user@mergington.edu`            | Join a meetup                                                       |
| DELETE | `/meetups/{meetup_id}/leave?email=user@mergington.edu`           | Leave a meetup                                                      |
| DELETE | `/meetups/{meetup_id}?email=organizer@mergington.edu`            | Delete a meetup (organizer only)                                   |

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:
   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Meetups** - Uses generated meetup ID as identifier:
   - Name/Title
   - Description
   - Location/City
   - Schedule
   - Maximum number of participants allowed
   - Category (academic/extra-curricular)
   - Organizer email
   - List of participant emails
   - Creation timestamp

3. **Students** - Uses email as identifier:
   - Name
   - Grade level

All data is stored in memory, which means data will be reset when the server restarts.
