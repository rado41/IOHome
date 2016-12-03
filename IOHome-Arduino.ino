#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>
#include <S2PRelay.h>
#include <ArduinoJson.h>

const char* ssid     = "JOKER";
const char* password = "fuckoff362436";
char hostString[16] = {0};

#define DATA D4
#define LATCH D5
#define CLK D6

ESP8266WebServer server ( 80 );
S2PRelay s2pRelay(DATA,LATCH,CLK);

void handleNotFound(){
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET)?"GET":"POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i=0; i<server.args(); i++){
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}

void _update(){
    unsigned int port = server.arg("port").toInt();
    unsigned int val = server.arg("val").toInt();
    
    if(!s2pRelay.SetRelayPort(port,val)) {
      server.send(400, "text/plain", "Invalid Port Data");
    } else {
      server.send(200, "text/plain", "Success");
    }
}

void _measure() {
    StaticJsonBuffer<512> jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    
    unsigned int port = server.arg("port").toInt();
    
    JsonObject& measurements = root.createNestedObject("measurements");
    
    if(ESUCCESS != s2pRelay.Measure(port,measurements)) {
      server.send(400, "text/plain", "Invalid Port Data");
    } else {
      String data;

      root["id"] = ESP.getChipId();
      root["measurements"] = measurements;
      root.printTo(data);

      server.send(200, "application/json", data);
    }
}

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);     // Initialize the LED_BUILTIN pin as an output
  
  Serial.begin(115200);
  delay(100);
  Serial.println("\r\nsetup()");

  sprintf(hostString, "IOHome_%06X", ESP.getChipId());
  Serial.print("Hostname: ");
  Serial.println(hostString);
  WiFi.hostname(hostString);

  if(ESUCCESS != s2pRelay.MaxPorts(8)){
    Serial.println("Invalid Max Ports");
  }
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

 if (!MDNS.begin(hostString)) {
    Serial.println("Error setting up MDNS responder!");
  }
  Serial.println("mDNS responder started");
  
  MDNS.addService("http", "tcp", 80); // Announce esp tcp service on port 8080

  server.on ( "/update", _update);
  server.on ( "/measure",_measure);
  server.onNotFound ( handleNotFound );
  
  server.begin();
  
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();

// the loop function runs over and over again forever
  digitalWrite(LED_BUILTIN, LOW);   // Turn the LED on (Note that LOW is the voltage level
                                    // but actually the LED is on; this is because 
                                    // it is acive low on the ESP-01)
  delay(1000);                      // Wait for a second
  digitalWrite(LED_BUILTIN, HIGH);  // Turn the LED off by making the voltage HIGH
  delay(2000); 
}
