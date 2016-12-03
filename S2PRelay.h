/**************************************************************
*  Name    : Relay Control using the S2P Chip and NOde MCU
*  Author  : Rama Chandra Reddy T
*  Date    : Nov-16,2016
*  Modified:
*  Version : 1.0
*  Notes   :
*          :
*****************************************************************/
#ifndef S2PRELAY_H
#define S2PRELAY_H
#include <ArduinoJson.h>
#include <Arduino.h>

#define ESUCCESS (0)
#define EINVAL (-1)
#define EEXIST (1)

#define ON 1
#define OFF 0

class S2PRelay
{
  public:
    int SetRelayPort(unsigned int relayPort,int state);
    int MaxPorts(unsigned int maxPorts);
    int Measure(unsigned int port,ArduinoJson::JsonObject& result);

    S2PRelay(int data,int clk,int latch);
    ~S2PRelay();

  private:
    int DATA = 0 ,LATCH = 0,CLK = 0;
    unsigned int RELAY_STATUS_MASK = 0;
    unsigned int MAXPORTS;

    int _Measure(unsigned int  port,ArduinoJson::JsonObject& result);
    int _SetGpioPort(int port,int state);
    int _PulseGpio(int gpio);
    int _Wr2Serial(int LATCH,int CLK,int DATA,int value);
};

#endif
