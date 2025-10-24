import serial
import time
from datetime import datetime

# === CONFIG ===
SERIAL_PORT = "COM7"    # Change to your Arduino port
BAUD_RATE = 9600

# === SETUP SERIAL ===
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
time.sleep(2)  # wait for Arduino reset

while True:
    try:
        line = ser.readline().decode("utf-8").strip()
        if not line:
            continue

        # Example line:
        # vp1,ip1,pp1,vp2,ip2,pp2,vp3,ip3,pp3,vb,ib,pb,percent,vl,il,pl,tempC
        values = line.split(",")

        if len(values) < 16:
            print("Invalid data:", line)
            continue

        # Parse floats
        vp1, ip1, pp1 = map(float, values[0:3])
        vp2, ip2, pp2 = map(float, values[3:6])
        vp3, ip3, pp3 = map(float, values[6:9])
        vb, ib, pb = map(float, values[9:12])
        percent = float(values[12])
        vl, il, pl = map(float, values[13:16])
        tempC = float(values[16]) if len(values) >= 17 else None

        timestamp = datetime.now().isoformat()

        # Build data dictionary (for display only)
        devices = [
            {"name": "pan1", "voltage": vp1, "current": ip1, "power": pp1},
            {"name": "pan2", "voltage": vp2, "current": ip2, "power": pp2},
            {"name": "pan3", "voltage": vp3, "current": ip3, "power": pp3},
            {"name": "pan4", "voltage": -1,  "current": -1,  "power": -1},
            {"name": "battery", "voltage": vb, "current": ib, "power": pb,
             "percent": percent, "temperature": tempC if tempC is not None else 0.0},
            {"name": "load", "voltage": vl, "current": il, "power": pl},
        ]

        # Display data in a clean format
        print("----------------------------------")
        print(f"Time: {timestamp}")
        print(f"{'Device':<10} {'Voltage(V)':>10} {'Current(A)':>12} {'Power(W)':>12} {'Percent(%)':>12} {'Temp(C)':>10}")
        print(f"{'-'*70}")
        for d in devices:
            print(f"{d['name']:<10} {d['voltage']:>10.2f} {d['current']:>12.2f} {d['power']:>12.2f} "
                  f"{d.get('percent', ''):>12} {d.get('temperature', ''):>10}")
        print("----------------------------------\n")

        time.sleep(1)

    except Exception as e:
        print("Error:", e)
        time.sleep(1)
