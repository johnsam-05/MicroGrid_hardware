// Multi Solar Panel + Battery + Load Monitor
// Using Voltage Sensors + LM35 for Battery Temp

const int panel1Pin = A0;
const int panel2Pin = A1;
const int panel3Pin = A2;
const int batteryPin = A3;
const int loadPin = A4;
const int tempPin = A5;

float calibration = 5.0 / 1023.0; // ADC scale (0-5V, 10-bit)
const float loadResistance = 10.0; // ohms (for panels and load)
const float batteryResistance = 5.0; // ohms (assumed internal load for calc)

// Li-ion battery parameters
const float batteryMin = 3.0; // 0% (discharged)
const float batteryMax = 4.2; // 100% (fully charged)

void setup() {
  Serial.begin(9600);
}

void loop() {
  // --- Panel 1 ---
  float vp1 = analogRead(panel1Pin) * calibration * 5.0;
  float ip1 = vp1 / loadResistance;
  float pp1 = vp1 * ip1;

  // --- Panel 2 ---
  float vp2 = analogRead(panel2Pin) * calibration * 5.0;
  float ip2 = vp2 / loadResistance;
  float pp2 = vp2 * ip2;

  // --- Panel 3 ---
  float vp3 = analogRead(panel3Pin) * calibration * 5.0;
  float ip3 = vp3 / loadResistance;
  float pp3 = vp3 * ip3;

  // --- Battery ---
  float vb = analogRead(batteryPin) * calibration * 5.0;
  float ib = vb / batteryResistance;
  float pb = vb * ib;

  // Battery percent
  float percent = ((vb - batteryMin) / (batteryMax - batteryMin)) * 100.0;
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;

  // --- Load ---
  float vl = analogRead(loadPin) * calibration * 5.0;
  float il = vl / loadResistance;
  float pl = vl * il;

  // --- Battery Temp (LM35, 10mV/°C) ---
  float tempVal = analogRead(tempPin) * calibration; // voltage
  float tempC = tempVal * 100.0; // °C

  // Print all in one line CSV
  Serial.print(vp1, 2); Serial.print(",");
  Serial.print(ip1, 2); Serial.print(",");
  Serial.print(pp1, 2); Serial.print(",");

  Serial.print(vp2, 2); Serial.print(",");
  Serial.print(ip2, 2); Serial.print(",");
  Serial.print(pp2, 2); Serial.print(",");

  Serial.print(vp3, 2); Serial.print(",");
  Serial.print(ip3, 2); Serial.print(",");
  Serial.print(pp3, 2); Serial.print(",");

  Serial.print(vb, 2); Serial.print(",");
  Serial.print(ib, 2); Serial.print(",");
  Serial.print(pb, 2); Serial.print(",");
  Serial.print(percent, 2); Serial.print(",");

  Serial.print(vl, 2); Serial.print(",");
  Serial.print(il, 2); Serial.print(",");
  Serial.print(pl, 2); Serial.print(",");

  Serial.print(tempC, 2); // last value (no trailing comma)
  
  Serial.println(); // new line

  delay(1000);
}
