from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models

router = APIRouter(prefix="/devices", tags=["Devices"])

# --- Schemas ---
class DeviceCreate(BaseModel):
    name: str
    ip_address: str
    description: Optional[str] = None

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[str] = None
    description: Optional[str] = None

# --- Routes ---
@router.get("/")
def get_all_devices(db: Session = Depends(get_db)):
    devices = db.query(models.Device).all()
    return devices

@router.get("/{device_id}")
def get_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.post("/")
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):
    new_device = models.Device(
        name=device.name,
        ip_address=device.ip_address,
        description=device.description
    )
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return new_device

@router.put("/{device_id}")
def update_device(device_id: int, device: DeviceUpdate, db: Session = Depends(get_db)):
    existing = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Device not found")

    if device.name:
        existing.name = device.name
    if device.ip_address:
        existing.ip_address = device.ip_address
    if device.description:
        existing.description = device.description

    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    db.delete(device)
    db.commit()

    return {
        "message": f"Device '{device.name}' deleted successfully"
    }