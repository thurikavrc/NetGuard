import re
import subprocess
import time


def ping_device(ip_address: str):
    try:
        start_time = time.time()

        result = subprocess.run(
            ["ping", "-n", "1", "-w", "1000", ip_address],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5,
            text=True
        )

        end_time = time.time()
        response_time = round((end_time - start_time) * 1000, 2)

        if result.returncode == 0:
            match = re.search(r"time[=<](\d+)ms", result.stdout)

            if match:
                response_time = float(match.group(1))

            return {
                "status": "online",
                "response_time": response_time
            }

        return {
            "status": "offline",
            "response_time": None
        }

    except subprocess.TimeoutExpired:
        return {
            "status": "offline",
            "response_time": None
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }