from sqlalchemy.orm import Session
from dotenv import load_dotenv
import models
import requests
import os
import json

load_dotenv()

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")


def send_to_n8n(alert_data: dict):
    try:
        if N8N_WEBHOOK_URL:
            requests.post(
                N8N_WEBHOOK_URL,
                json=alert_data,
                timeout=5
            )
    except Exception as e:
        print(f"n8n Error: {e}")


def check_and_generate_alerts(device, ping_result: dict, port_results: list, db: Session):
    alerts_generated = []

    # Get previous scan (skip current scan)
    last_scan = (
        db.query(models.ScanHistory)
        .filter(models.ScanHistory.device_id == device.id)
        .order_by(models.ScanHistory.scan_time.desc())
        .offset(1)
        .first()
    )

    current_status = ping_result["status"]

    # Device Offline
    if current_status == "offline":
        alert = models.Alert(
            device_id=device.id,
            alert_type="DEVICE_OFFLINE",
            message=f"Device '{device.name}' ({device.ip_address}) is OFFLINE."
        )

        db.add(alert)
        db.commit()

        alerts_generated.append("DEVICE_OFFLINE")

        send_to_n8n({
            "alert_type": "DEVICE_OFFLINE",
            "device_name": device.name,
            "ip_address": device.ip_address,
            "message": alert.message
        })

    # Device Back Online
    elif (
        current_status == "online"
        and last_scan
        and last_scan.status == "offline"
    ):

        alert = models.Alert(
            device_id=device.id,
            alert_type="DEVICE_ONLINE",
            message=f"Device '{device.name}' ({device.ip_address}) is back ONLINE."
        )

        db.add(alert)
        db.commit()

        alerts_generated.append("DEVICE_ONLINE")

        send_to_n8n({
            "alert_type": "DEVICE_ONLINE",
            "device_name": device.name,
            "ip_address": device.ip_address,
            "message": alert.message
        })

    # Port State Change
    if last_scan and last_scan.port_results:
        try:
            previous_ports = json.loads(last_scan.port_results)

            previous_map = {
                p["port"]: p["status"]
                for p in previous_ports
            }

            for port_info in port_results:

                previous_status = previous_map.get(port_info["port"])

                if (
                    previous_status
                    and previous_status != port_info["status"]
                ):

                    message = (
                        f"Port {port_info['port']} "
                        f"({port_info['service']}) "
                        f"changed from "
                        f"{previous_status.upper()} "
                        f"to "
                        f"{port_info['status'].upper()}."
                    )

                    alert = models.Alert(
                        device_id=device.id,
                        alert_type="PORT_STATE_CHANGE",
                        message=message
                    )

                    db.add(alert)
                    db.commit()

                    alerts_generated.append("PORT_STATE_CHANGE")

                    send_to_n8n({
                        "alert_type": "PORT_STATE_CHANGE",
                        "device_name": device.name,
                        "ip_address": device.ip_address,
                        "message": message
                    })

        except Exception as e:
            print(f"Port comparison error: {e}")

    return alerts_generated