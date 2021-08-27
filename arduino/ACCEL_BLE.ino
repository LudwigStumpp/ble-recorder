#include <ArduinoBLE.h>
#include <Arduino_LSM9DS1.h>

float accelX, accelY, accelZ;

BLEService accelService("4119d95e-ebbc-4df8-8e11-a41dcbf6675e");
BLEStringCharacteristic accelCharacteristic("12b66e62-df52-462d-bda5-03c6ce4942ea", BLERead | BLENotify, 17);

void setup() {
  IMU.begin();
  Serial.begin(9600);
  // while (!Serial);

  pinMode(LED_BUILTIN, OUTPUT);

  if (!BLE.begin()) {
    Serial.println("BLE failed to Initiate");
    delay(500);
    while (1);
  }

  BLE.setLocalName("Arduino Accelerometer");
  BLE.setAdvertisedService(accelService);
  accelService.addCharacteristic(accelCharacteristic);
  BLE.addService(accelService);
  accelCharacteristic.writeValue("0.00,0.00,0.00");
  BLE.advertise();

  Serial.println("Bluetooth device is now active, waiting for connections...");
}

void loop() {
  BLEDevice central = BLE.central();
  if (central) {
    Serial.print("Connected to central: ");
    Serial.println(central.address());
    digitalWrite(LED_BUILTIN, HIGH);
    while (central.connected()) {
      // delay(100);
      read_Accel();

      String del = ";";
      String msg = String(accelX) + del + String(accelY) + del + String(accelZ);
      accelCharacteristic.writeValue(msg);
      
      Serial.print(accelX);
      Serial.print('\t');
      Serial.print(accelY);
      Serial.print('\t');
      Serial.println(accelZ);
    }
  }
  digitalWrite(LED_BUILTIN, LOW);
  Serial.print("Disconnected from central: ");
  Serial.println(central.address());
}

void read_Accel() {
  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(accelX, accelY, accelZ);
  }
}