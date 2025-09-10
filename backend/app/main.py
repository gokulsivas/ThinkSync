from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="Collaborative Research Platform API",
    description="A platform for researchers to collaborate and share knowledge",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
from app.api.v1 import profiles
app.include_router(profiles.router, prefix="/api/v1", tags=["profiles"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Collaborative Research Platform API", 
        "version": "1.0.0",
        "status": "running"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

