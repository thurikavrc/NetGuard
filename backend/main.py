from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import Base, engine
import models

from routes import alerts
from routes import devices
from routes import scans

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NetGuard API",
    description="Network Monitoring & Security Alert System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.10:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register routers
app.include_router(alerts.router)
app.include_router(devices.router)
app.include_router(scans.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to NetGuard API 🚀"
    }


@app.get("/test-db")
def test_database():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "message": "Database connected successfully! ✅"
        }

    except Exception as e:
        return {
            "error": str(e)
        }