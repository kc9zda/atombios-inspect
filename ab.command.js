/*
Copyright 2018 Joseph Havens

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var command_names = ["ASIC_Init",
	"GetDisplaySurfaceSize",
	"ASIC_RegistersInit",
	"VRAM_BlockVenderDetection",
	"DIGxEncoderControl",
	"MemoryControllerInit",
	"EnableCRTCMemReq",
	"MemoryParamAdjust",
	"DVOEncoderControl",
	"GPIOPinControl",
	"SetEngineClock",
	"SetMemoryClock",
	"SetPixelClock",
	"EnableDispPowerGating",
	"ResetMemoryDLL",
	"ResetMemoryDevice",
	"MemoryPLLInit",
	"AdjustDisplayPLL",
	"AdjustMemoryController",
	"EnableASIC_StaticPwrMgt",
	"SetUniphyInstance",
	"DAC_LoadDetection",
	"LVTMAEncoderControl",
	"HW_Misc_Operation",
	"DAC1EncoderControl",
	"DAC2EncoderControl",
	"DVOOutputControl",
	"CV1OutputControl",
	"GetConditionalGoldenSetting",
	"SMC_Init",
	"PatchMCSetting",
	"MC_SEQ_Control",
	"Gfx_Harvesting",
	"EnableScaler",
	"BlankCRTC",
	"EnableCRTC",
	"GetPixelClock",
	"EnableVGA_Render",
	"GetSCLKOverMCLKRatio",
	"SetCRTC_Timing",
	"SetCRTC_OverScan",
	"GetSMUClock_Info",
	"SelectCRTC_Source",
	"EnableGraphSurfaces",
	"UpdateCRTC_DoubleBufferRegisters",
	"LUT_AutoFill",
	"SetDCEClock",
	"GetMemoryClock",
	"GetEngineClock",
	"SetCRTC_UsingDTDTiming",
	"ExternalEncoderControl",
	"LVTMAOutputControl",
	"VRAM_BlockDetectionByStrap",
	"MemoryCleanUp",
	"ProcessI2CChannelTransaction",
	"WriteOneByteToHWAssistedI2C",
	"ReadHWAssistedI2CStatus",
	"SpeedFanControl",
	"PowerConnectorDectection",
	"MC_Synchronization",
	"ComputeMemoryEnginePLL",
	"Gfx_Init",
	"VRAM_GetCurrentInfoBlock",
	"DynamicMemorySettings",
	"MemoryTraining",
	"EnableSpreadSpectrumOnPPLL",
	"TMDSAOutputControl",
	"SetVoltage",
	"DAC1OutputControl",
	"ReadEfuseValue",
	"ComputeMemoryClockParam",
	"ClockSource",
	"MemoryDeviceInit",
	"GetDispObjectInfo",
	"DIG1EncoderControl",
	"DIG2EncoderControl",
	"DIG1TransmitterControl",
	"DIG2TransmitterControl",
	"ProcessAuxChannelTransaction",
	"DPEncoderService",
	"GetVoltageInfo"
	];
	
function parse_commands() {
	var s="";
	var t=[
	{offset:0x00, name:"Common Header", type:"ch"}
	];
	var vt;

	vt = list_commands();
	for (var i=0;i<vt.length;i++) {
		t.push(vt[i]);
	}
	s+=print_rom_table(t,pointers.command);
	return s;
}

function list_commands() {
	var vt = [];
	
	for(var i=0;i<command_names.length;i++) {
		vt.push({offset: 4+(i*2), name: "<a href=\"#cmd"+i+"\">"+command_names[i]+"</a>", type:"uhw"});
	}
	return vt;
}