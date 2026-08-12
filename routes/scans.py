
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db

from services.ping_service import ping_device
from services.port_scanner import scan_ports
from services.alert_service import check_and_generate_alerts

import models
import json

router = APIRouter(prefix="/scan", tags=["Scans"])


@router.post("/{device_id}")
def scan_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Ping device
    ping_result = ping_device(device.ip_address)

    # Scan ports
    port_results = scan_ports(device.ip_address)

    # Save scan history
    scan = models.ScanHistory(
        device_id=device.id,
        status=ping_result["status"],
        response_time=ping_result["response_time"],
        port_results=json.dumps(port_results)
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Generate alerts
    alerts = check_and_generate_alerts(
        device=device,
        ping_result=ping_result,
        port_results=port_results,
        db=db
    )

    return {
        "device_id": device.id,
        "device_name": device.name,
        "ip_address": device.ip_address,
        "status": ping_result["status"],
        "response_time": ping_result["response_time"],
        "ports": port_results,
        "scan_time": scan.scan_time,
        "alerts_generated": alerts
    }


@router.post("/all")
def scan_all_devices(db: Session = Depends(get_db)):
    devices = db.query(models.Device).all()

    if not devices:
        raise HTTPException(status_code=404, detail="No devices found")

    results = []

    for device in devices:
        ping_result = ping_device(device.ip_address)
        port_results = scan_ports(device.ip_address)

        scan = models.ScanHistory(
            device_id=device.id,
            status=ping_result["status"],
            response_time=ping_result["response_time"],
            port_results=json.dumps(port_results)
        )

        db.add(scan)
        db.commit()

        results.append({
            "device_id": device.id,
            "device_name": device.name,
            "ip_address": device.ip_address,
            "status": ping_result["status"],
            "response_time": ping_result["response_time"],
            "ports": port_results
        })

    return results


@router.get("/history")
def get_scan_history(db: Session = Depends(get_db)):
    scans = (
        db.query(models.ScanHistory)
        .order_by(models.ScanHistory.scan_time.desc())
        .all()
    )

    return scans