#include <ArduinoBLE.h>
#include <Arduino_LSM9DS1.h>

float accX, accY, accZ; // max. 5 characters String each (if negative)
unsigned long myTime; // max. 10 characters String
const String del = ";"; // 1 character
const int strLen = 10 + 3 * 5 + 3; // + 3 for 3 delimiters

// check https://www.uuidgenerator.net/ to generate your own unique UUIDs
BLEService accelService("TO_BE_FILLED");
BLEStringCharacteristic accelCharacteristic("TO_BE_FILLED", BLERead | BLENotify, strLen);

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
  accelCharacteristic.writeValue("1111111111;-0.00;-0.00;-0.00");
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
      // delay(1);

      read_Accel();
      myTime = millis();

      String msg = get_message();
      accelCharacteristic.writeValue(msg);

      print_to_serial();
    }
  }
  digitalWrite(LED_BUILTIN, LOW);
  Serial.print("Disconnected from central: ");
  Serial.println(central.address());
}

void read_Accel() {
  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(accX, accY, accZ);
  }
}

void print_to_serial() {
  Serial.print(myTime); Serial.print('\t');
  Serial.print(accX); Serial.print('\t');
  Serial.print(accY); Serial.print('\t');
  Serial.print(accZ); Serial.print('\n');
}

String get_message() {
  return String(myTime) + del + String(accX) + del + String(accY) + del + String(accZ); 
}