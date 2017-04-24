

int lighSensorPin = A0;    // Light sensor pin
int tempSensorPin = A1; //Temperature sensor pin
int lighSensorValue = 0;  // Light Sensor Reading
int tempSensorValue = 0;  //Temperature sensor reading
int batSensorValue = 0; //Battery sensor value

String test;
void setup() {
  Serial.begin(9600);
}

void loop() {
  // read the value from the sensor:
  lighSensorValue = analogRead(lighSensorPin);
  tempSensorValue = analogRead(tempSensorPin);
  batSensorValue = random(480,600);
  test = "battery:" + String(batSensorValue/10.0) + ",light:" + String(lighSensorValue) + ",temperature:"+String(tempSensorValue);
//  Serial.print("Light: ");
//  Serial.print(lighSensorValue);
//
//  Serial.print("    Temp: ");
  Serial.println(test);

  //Serial.println("--------------------");
  delay(500);

 
  
}
