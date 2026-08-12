import socket

PORTS_TO_SCAN = {
    22: "SSH",
    80: "HTTP",
    443: "HTTPS",
    3306: "MySQL",
    8080: "HTTP-Alt"
}

def scan_ports(ip_address: str):
    results = []

    for port, service in PORTS_TO_SCAN.items():
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((ip_address, port))
            sock.close()

            status = "open" if result == 0 else "closed"

        except Exception:
            status = "closed"

        results.append({
            "port": port,
            "service": service,
            "status": status
        })

    return results