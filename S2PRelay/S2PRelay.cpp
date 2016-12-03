#include "S2PRelay.h"
#include <Arduino.h>

int S2PRelay::_SetGpioPort(int port,int state)
{
  pinMode(port, OUTPUT);
  if(state)
    digitalWrite(port,state);
  else
    digitalWrite(port,state);
  return ESUCCESS;
}

int S2PRelay::_PulseGpio(int gpio)
{
  int ret;
  ret = _SetGpioPort(gpio,1);
  ret = _SetGpioPort(gpio,0);
  return ret;
}

/*
* Description: Writes the 8 bit Value on 74HC595 S2P Converter
* latch: latch line
* clk: Clock line
* data: data line to S2P
* Value: Value to write to parallel
* Note: Realyboard operates as follows
*   Realy Pin = 0, Realy Active meaning ON
*   relayPort Pin = 1, relayPort Inactive maning OFF
*/
int S2PRelay::_Wr2Serial(int latch,int clk,int data,int value)
{
  int msb = 1<<(MAXPORTS-1);

  for(unsigned int x = 0 ; x < MAXPORTS; x++) {

    if((value & msb) == msb)
      _SetGpioPort(data,0);
    else
      _SetGpioPort(data,1);

    _PulseGpio(clk);
    value <<= 0x1;
  }

  return _PulseGpio(latch);
}

/*  It uses 3 Select pins to select the input
 *
 */
int S2PRelay::_Measure(unsigned int port,ArduinoJson::JsonObject& result)
{

  if(0 == port) {
    for(unsigned int i = 0; i < MAXPORTS; i++) {
      result[String(i)] = i;
    }
  } else {
    result[String(port)] = 0.1f;
  }
  return ESUCCESS;
}

/*  Measure Current sensor value
*   If the Port = 0, it is assumed to return All the Ports measurement
*/
int S2PRelay::Measure(unsigned int relayPort,ArduinoJson::JsonObject& result)
{
  if(relayPort <= MAXPORTS){
      return S2PRelay::_Measure(relayPort,result);
  }
  return EINVAL;
}
/*
* Description: Set a Desired Relay Port with specified State
* relayPort: Relay port 0-7 Corresponding to 1-8
*
*/
int S2PRelay::SetRelayPort(unsigned int relayPort,int state)
{
  int ret;

  if(relayPort > MAXPORTS){
    return EINVAL;
  }

  if((RELAY_STATUS_MASK & 1<<relayPort) == (state<<relayPort))
    return EEXIST;
  else if(state)
    RELAY_STATUS_MASK += 1<<relayPort;
  else
    RELAY_STATUS_MASK -= 1<<relayPort;

  return _Wr2Serial(LATCH,CLK,DATA,RELAY_STATUS_MASK);
}

int S2PRelay::MaxPorts(unsigned int maxPorts)
{
  if(maxPorts%8) {
    return EINVAL;
  }

  MAXPORTS = maxPorts;
  return ESUCCESS;
}

S2PRelay::S2PRelay(int data,int clk,int latch)
{
  /*
    if(data == clk || data == latch || clk == latch) {
      return EINVAL;
    }
  */

  DATA = data;
  CLK = clk;
  LATCH = latch;
  RELAY_STATUS_MASK = 0;
  MAXPORTS = 8;

  _SetGpioPort(LATCH,LOW);
  _SetGpioPort(CLK,LOW);
  _SetGpioPort(DATA,LOW);
}

S2PRelay::~S2PRelay() {

}
