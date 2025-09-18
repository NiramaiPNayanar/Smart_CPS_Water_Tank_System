#include <WiFi.h>
#include <PubSubClient.h>

// WiFi credentials
const char* ssid        = "Your wifi name here";
const char* password    = "Your wifi password here";

// MQTT broker details
const char* mqtt_server = "120.0.0.1";
const int   mqtt_port   = 1883;
const char* topic_pub   = "esp32/ultrasonic";
const char* topic_hc12  = "esp32/hc12";   // NEW topic for HC12 data

WiFiClient espClient;
PubSubClient client(espClient);

// Ultrasonic sensor pins
#define TRIG_PIN 5
#define ECHO_PIN 4

long duration;
float distance;
int hc12Value;

unsigned long lastPublish = 0;
const unsigned long publishInterval = 2000; // every 2 sec

// HC-12 on Serial2 (change pins if needed)
#define HC12_TX 17
#define HC12_RX 16

// MQTT callback
void callback(char* topic, byte* message, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)message[i];

  if (msg == "ping") {
    client.publish(topic_pub, "{\"response\":\"pong\"}");
  }
}

void setupWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32_Ultrasonic")) {
      client.subscribe("esp32/ultrasonic/cmd");
    } else {
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, HC12_RX, HC12_TX); // HC-12 baud

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  setupWiFi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  unsigned long now = millis();
  if (now - lastPublish >= publishInterval) {
    lastPublish = now;

    // Send ultrasonic pulse
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // Measure echo
    duration = pulseIn(ECHO_PIN, HIGH, 30000);
    distance = duration * 0.034 / 2; // cm

    // Decide HC-12 value
    hc12Value = (distance > 8.0) ? 1 : 0;

    // Send via HC-12
    Serial2.print(hc12Value);

    // Publish both distance + HC12 value
    String payload = "{";
    payload += "\"distance\": " + String(distance, 2) + ",";
    payload += "\"hc12\": " + String(hc12Value);
    payload += "}";

    client.publish(topic_pub, payload.c_str());
    client.publish(topic_hc12, String(hc12Value).c_str());
  }
}
