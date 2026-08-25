from fastapi import APIRouter
from app.api.endpoints import attendance, departments, health, interns, projects

api_router = APIRouter()

# Mount health endpoints
api_router.include_router(health.router)

# Mount departments endpoints
api_router.include_router(departments.router)

# Mount interns endpoints
api_router.include_router(interns.router)

# Mount projects endpoints
api_router.include_router(projects.router)

# Mount attendance endpoints
api_router.include_router(attendance.router)

