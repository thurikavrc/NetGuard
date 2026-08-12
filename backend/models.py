from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    ip_address = Column(String(45), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    scans = relationship(
        "ScanHistory",
        back_populates="device",
        cascade="all, delete"
    )

    alerts = relationship(
        "Alert",
        back_populates="device",
        cascade="all, delete"
    )


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)

    scan_time = Column(DateTime, default=datetime.now)

    status = Column(
        Enum("online", "offline"),
        nullable=False
    )

    response_time = Column(Float, nullable=True)

    # Stores scan results (we'll save JSON as text for simplicity)
    port_results = Column(Text, nullable=True)

    device = relationship(
        "Device",
        back_populates="scans"
    )


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)

    alert_type = Column(String(100), nullable=False)

    message = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.now)

    acknowledged = Column(Boolean, default=False)

    device = relationship(
        "Device",
        back_populates="alerts"
    )