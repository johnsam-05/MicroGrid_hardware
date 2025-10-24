import serial
import time
import json
import requests
from datetime import datetime

# === CONFIG ===
SERIAL_PORT = "COM7"    # Change to your Arduino port
BAUD_RATE = 9600
ip = "localhost"
API_URL = "http://"+ip+":5000/api/devices"  # Replace with your API endpoint

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

        # Build JSON packet
        json_packet = [
            {
                "name": "pan1",
                "voltageUsed": round(vp1, 2),
                "voltageReceived": round(vp1, 2),
                "currentReceived": round(ip1, 2),
                "powerGenerated": round(pp1, 2),
                "timestamp": timestamp
            },
            {
                "name": "pan2",
                "voltageUsed": round(vp2, 2),
                "voltageReceived": round(vp2, 2),
                "currentReceived": round(ip2, 2),
                "powerGenerated": round(pp2, 2),
                "timestamp": timestamp
            },
            {
                "name": "pan3",
                "voltageUsed": round(vp3, 2),
                "voltageReceived": round(vp3, 2),
                "currentReceived": round(ip3, 2),
                "powerGenerated": round(pp3, 2),
                "timestamp": timestamp
            },
            {
                "name": "pan4",
                "voltageUsed": -1,
                "voltageReceived": -1,
                "currentReceived": -1,
                "powerGenerated": -1,
                "timestamp": timestamp
            },
            {
                "name": "battery",
                "voltageUsed": round(vb, 2),
                "voltageReceived": round(vb, 2),
                "currentReceived": round(ib, 2),
                "powerGenerated": round(pb, 2),
                "percent": round(percent, 1),
                "temperature": round(tempC, 1) if tempC is not None else 0.0,
                "timestamp": timestamp
            },
            {
                "name": "load",
                "voltageUsed": round(vl, 2),
                "voltageReceived": round(vl, 2),
                "currentReceived": round(il, 2),
                "powerGenerated": round(pl, 2),
                "timestamp": timestamp
            }
        ]

        # Display data in a clean format
        print("----------------------------------")
        print(f"{'Device':<10} {'Voltage(V)':>10} {'Current(A)':>12} {'Power(W)':>12} {'Percent(%)':>12} {'Temp(C)':>10}")
        print(f"{'-'*70}")
        for d in json_packet:
            print(f"{d['name']:<10} {d['voltageUsed']:>10} {d['currentReceived']:>12} {d['powerGenerated']:>12} "
                  f"{d.get('percent', ''):>12} {d.get('temperature', ''):>10}")
        print("----------------------------------")

        # Send JSON packet to API
        try:
            response = requests.post(API_URL, json=json_packet)
            if response.status_code in [200, 201]:
                print("Data sent successfully!")
            else:
                print(f"Failed to send data. Status code: {response.status_code}")
        except Exception as api_error:
            print("API Error:", api_error)

        time.sleep(0.5)

    except Exception as e:
        print("Error:", e)
        time.sleep(1)
