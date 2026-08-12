from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models

router = APIRouter(prefix="/alerts", tags=["Alerts"])


# Get all alerts
@router.get("/")
def get_all_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(models.Alert)
        .order_by(models.Alert.created_at.desc())
        .all()
    )
    return alerts


# Get only unacknowledged alerts
@router.get("/unacknowledged")
def get_unacknowledged_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(models.Alert)
        .filter(models.Alert.acknowledged == False)
        .order_by(models.Alert.created_at.desc())
        .all()
    )
    return alerts


# Acknowledge an alert
@router.patch("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = (
        db.query(models.Alert)
        .filter(models.Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    alert.acknowledged = True

    db.commit()
    db.refresh(alert)

    return {
        "message": "Alert acknowledged successfully.",
        "alert": alert
    }