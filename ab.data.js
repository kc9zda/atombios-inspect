/*
Copyright 2018 Joseph Havens

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function parse_data() {
	var s="";
	var t = [
		{offset: 0x00, name: "Common Header", type:"ch"},
		{offset: 0x04, name: "UtilityPipeline", type:"uhw"},
		{offset: 0x06, name: "MultimediaCapabilityInfo", type:"uhw"},
		{offset: 0x08, name: "MultimediaConfigInfo", type:"uhw"},
		{offset: 0x0A, name: "StandardVesa_Timing", type:"uhw"},
		{offset: 0x0C, name: table_link("FirmwareInfo","dt4"), type:"uhw"},
		{offset: 0x0E, name: table_link("PaletteData","dt5"), type:"uhw"},
		{offset: 0x10, name: "LVDS_Info<br>LCD_Info", type:"uhw"},
		{offset: 0x12, name: "DIGTransmitterInfo", type:"uhw"},
		{offset: 0x14, name: "AnalogTV_Info", type:"uhw"},
		{offset: 0x16, name: "SupportedDevicesInfo", type:"uhw"},
		{offset: 0x18, name: "GPIO_I2C_Info", type:"uhw"},
		{offset: 0x1A, name: "VRAM_UsageByFirmware", type:"uhw"},
		{offset: 0x1C, name: "GPIO_Pin_LUT", type:"uhw"},
		{offset: 0x1E, name: "VESA_ToInternalModeLUT", type:"uhw"},
		{offset: 0x20, name: "GFX_Info", type:"uhw"},
		{offset: 0x22, name: "PowerPlayInfo", type:"uhw"},
		{offset: 0x24, name: "GPUVirtualizationInfo", type:"uhw"},
		{offset: 0x26, name: "SaveRestoreInfo", type:"uhw"},
		{offset: 0x28, name: "PPLL_SS_Info", type:"uhw"},
		{offset: 0x2A, name: "OemInfo", type:"uhw"},
		{offset: 0x2C, name: "XTMDS_Info", type:"uhw"},
		{offset: 0x2E, name: "MclkSS_Info", type:"uhw"},
		{offset: 0x30, name: "Object_header", type:"uhw"},
		{offset: 0x32, name: "IndirectIOAccess", type:"uhw"},
		{offset: 0x34, name: "MC_InitParameter", type:"uhw"},
		{offset: 0x36, name: "ASIC_VDDC_Info", type:"uhw"},
		{offset: 0x38, name: "ASIC_InternalSS_Info", type:"uhw"},
		{offset: 0x3A, name: "TV_VideoMode", type:"uhw"},
		{offset: 0x3C, name: "VRAM_Info", type:"uhw"},
		{offset: 0x3E, name: "MemoryTrainingInfo", type:"uhw"},
		{offset: 0x40, name: "IntegratedSystemInfo", type:"uhw"},
		{offset: 0x42, name: "ASIC_ProfilingInfo", type:"uhw"},
		{offset: 0x44, name: "VoltageObjectInfo", type:"uhw"},
		{offset: 0x46, name: "PowerSourceInfo", type:"uhw"},
		{offset: 0x48, name: "ServiceInfo", type:"uhw"}
		];
		
	s = print_rom_table(t,pointers.data);
	s+= parse_data_tables();
	return s;
}

function parse_data_tables() {
	var s="";
	
	if (rom16(pointers.data+0x06)!=0) { // Multimedia Capability Info / ???
		if (rom8(pointers.data+0x02)==1) { // Format rev 1
			s+=gen_header("Multimedia Capability Information","dt1");
			s+=parse_multimedia_capability();
		}
	}
	if (rom16(pointers.data+0x0C)!=0) { // Firmware Info
		s+=gen_header("Firmware Information","dt4");
		s+=parse_firmware_info();
	}
	if (rom16(pointers.data+0x0E)!=0) {
		s+=gen_header("Palette Data","dt5");
		//s+=gen_hexdump(rom16(pointers.data+0x0E),256);
		s+=gen_palette(rom16(pointers.data+0x0E));
	}
	if (rom16(pointers.data+0x10)!=0) { // LCD/LVDS Info
		s+=gen_header("LCD/LVDS Information","dt6");
		s+=parse_lcd();
	}
	s+="</div>";
	return s;
}

function parse_multimedia_capability() {
	var s = "";
	var t = [
		{offset: 0x00, name: "Signature", type:"fs", length:4},
		{offset: 0x04, name: "I2C Type", type:"uhb"},
		{offset: 0x05, name: "TV out info", type:"uhb"},
		{offset: 0x06, name: "Video port info", type:"uhb"},
		{offset: 0x07, name: "Host port info", type:"uhb"}
		];
	
	s+= print_rom_table(t,rom16(pointers.data+0x06));
	return s;
}

function parse_firmware_info() {
	var s = "";
	var t = [
		{offset: 0x00, name: "Common Header", type:"ch"},
		{offset: 0x04, name: "Firmware Revision", type:"uhl"},
		];
	var vt;

	vt = get_specific_firmware_struct(rom8(rom16(pointers.data+0x0C)+0x02),rom8(rom16(pointers.data+0x0C)+0x03));
	for (var i=0;i<vt.length;i++) {
		t.push(vt[i]);
	}
	s+= print_rom_table(t,rom16(pointers.data+0x0C));
	return s;
}

function get_specific_firmware_struct(f,c) {
	var r = [];
	
	switch (f) {
		case 1:
			switch (c) {
				case 1:
					r = [
					{offset: 0x08, name: "Default Engine Clock", type: "c10kl"},
					{offset: 0x0C, name: "Default Memory Clock", type: "c10kl"},
					{offset: 0x10, name: "Driver Target Engine Clock", type: "c10kl"},
					{offset: 0x14, name: "Driver Target Memory Clock", type: "c10kl"},
					{offset: 0x18, name: "Max Engine Clock PLL Output", type: "c10kl"},
					{offset: 0x1C, name: "Max Memory Clock PLL Output", type: "c10kl"},
					{offset: 0x20, name: "Max Pixel Clock PLL Output", type: "c10kl"},
					{offset: 0x24, name: "ASIC Max Engine Clock", type: "c10kl"},
					{offset: 0x28, name: "ASIC Max Memory Clock", type: "c10kl"},
					{offset: 0x2C, name: "ASIC Max Temperature", type: "uhb"},
					{offset: 0x3C, name: "Min Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x3E, name: "Max Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x40, name: "Min Engine Clock Output", type: "c10ks"},
					{offset: 0x42, name: "Min Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x44, name: "Max Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x46, name: "Min Memory Clock Output", type: "c10ks"},
					{offset: 0x48, name: "Max Pixel Clock", type: "c10ks"},
					{offset: 0x4A, name: "Min Pixel Clock PLL Input", type: "c10ks"},
					{offset: 0x4C, name: "Max Pixel Clock PLL Input", type: "c10ks"},
					{offset: 0x4E, name: "Min Pixel Clock Output", type: "c10ks"},
					{offset: 0x50, name: "Firmware Capability", type:"uhw"}, // todo: decode
					{offset: 0x52, name: "Reference Clock", type: "c10ks"},
					{offset: 0x54, name: "RTS PM4 Starting Location in ROM", type:"uhw"},
					{offset: 0x56, name: "RTS PM4 Packets", type:"uhb"},
					{offset: 0x57, name: "Design ID", type:"uhb"},
					{offset: 0x58, name: "Memory Module ID", type:"uhb"},
					];
					break;
				case 2:
					r = [
					{offset: 0x08, name: "Default Engine Clock", type: "c10kl"},
					{offset: 0x0C, name: "Default Memory Clock", type: "c10kl"},
					{offset: 0x10, name: "Driver Target Engine Clock", type: "c10kl"},
					{offset: 0x14, name: "Driver Target Memory Clock", type: "c10kl"},
					{offset: 0x18, name: "Max Engine Clock PLL Output", type: "c10kl"},
					{offset: 0x1C, name: "Max Memory Clock PLL Output", type: "c10kl"},
					{offset: 0x20, name: "Max Pixel Clock PLL Output", type: "c10kl"},
					{offset: 0x24, name: "ASIC Max Engine Clock", type: "c10kl"},
					{offset: 0x28, name: "ASIC Max Memory Clock", type: "c10kl"},
					{offset: 0x2C, name: "ASIC Max Temperature", type: "uhb"},
					{offset: 0x2D, name: "Min Allowed BL Level", type: "uhb"},
					{offset: 0x38, name: "Min Pixel Clock Output", type: "c10kl"},
					{offset: 0x3C, name: "Min Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x3E, name: "Max Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x40, name: "Min Engine Clock Output", type: "c10ks"},
					{offset: 0x42, name: "Min Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x44, name: "Max Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x46, name: "Min Memory Clock Output", type: "c10ks"},
					{offset: 0x48, name: "Max Pixel Clock", type: "c10ks"},
					{offset: 0x4A, name: "Min Pixel Clock PLL Input", type: "c10ks"},
					{offset: 0x4C, name: "Max Pixel Clock PLL Input", type: "c10ks"},
					//{offset: 0x4E, name: "Min Pixel Clock Output", type: "c10ks"},
					{offset: 0x50, name: "Firmware Capability", type:"uhw"}, // todo: decode
					{offset: 0x52, name: "Reference Clock", type: "c10ks"},
					{offset: 0x54, name: "RTS PM4 Starting Location in ROM", type:"uhw"},
					{offset: 0x56, name: "RTS PM4 Packets", type:"uhb"},
					{offset: 0x57, name: "Design ID", type:"uhb"},
					{offset: 0x58, name: "Memory Module ID", type:"uhb"},
					];
					break;
				case 3:
					r = [
					{offset: 0x08, name: "Default Engine Clock", type: "c10kl"},
					{offset: 0x0C, name: "Default Memory Clock", type: "c10kl"},
					{offset: 0x10, name: "Driver Target Engine Clock", type: "c10kl"},
					{offset: 0x14, name: "Driver Target Memory Clock", type: "c10kl"},
					{offset: 0x18, name: "Max Engine Clock PLL Output", type: "c10kl"},
					{offset: 0x1C, name: "Max Memory Clock PLL Output", type: "c10kl"},
					{offset: 0x20, name: "Max Pixel Clock PLL Output", type: "c10kl"},
					{offset: 0x24, name: "ASIC Max Engine Clock", type: "c10kl"},
					{offset: 0x28, name: "ASIC Max Memory Clock", type: "c10kl"},
					{offset: 0x2C, name: "ASIC Max Temperature", type: "uhb"},
					{offset: 0x2D, name: "Min Allowed BL Level", type: "uhb"},
					{offset: 0x34, name: "3D Acceleration Engine Clock", type: "c10kl"},
					{offset: 0x38, name: "Min Pixel Clock Output", type: "c10kl"},
					{offset: 0x3C, name: "Min Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x3E, name: "Max Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x40, name: "Min Engine Clock Output", type: "c10ks"},
					{offset: 0x42, name: "Min Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x44, name: "Max Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x46, name: "Min Memory Clock Output", type: "c10ks"},
					{offset: 0x48, name: "Max Pixel Clock", type: "c10ks"},
					{offset: 0x4A, name: "Min Pixel Clock PLL Input", type: "c10ks"},
					{offset: 0x4C, name: "Max Pixel Clock PLL Input", type: "c10ks"},
					//{offset: 0x4E, name: "Min Pixel Clock Output", type: "c10ks"},
					{offset: 0x50, name: "Firmware Capability", type:"uhw"}, // todo: decode
					{offset: 0x52, name: "Reference Clock", type: "c10ks"},
					{offset: 0x54, name: "RTS PM4 Starting Location in ROM", type:"uhw"},
					{offset: 0x56, name: "RTS PM4 Packets", type:"uhb"},
					{offset: 0x57, name: "Design ID", type:"uhb"},
					{offset: 0x58, name: "Memory Module ID", type:"uhb"},
					];
					break;
				case 4:
					r = [
					{offset: 0x08, name: "Default Engine Clock", type: "c10kl"},
					{offset: 0x0C, name: "Default Memory Clock", type: "c10kl"},
					{offset: 0x10, name: "Driver Target Engine Clock", type: "c10kl"},
					{offset: 0x14, name: "Driver Target Memory Clock", type: "c10kl"},
					{offset: 0x18, name: "Max Engine Clock PLL Output", type: "c10kl"},
					{offset: 0x1C, name: "Max Memory Clock PLL Output", type: "c10kl"},
					{offset: 0x20, name: "Max Pixel Clock PLL Output", type: "c10kl"},
					{offset: 0x24, name: "ASIC Max Engine Clock", type: "c10kl"},
					{offset: 0x28, name: "ASIC Max Memory Clock", type: "c10kl"},
					{offset: 0x2C, name: "ASIC Max Temperature", type: "uhb"},
					{offset: 0x2D, name: "Min Allowed BL Level", type: "uhb"},
					{offset: 0x2E, name: "Boot up VDDC Voltage", type: "vmvs"},
					{offset: 0x30, name: "LCD Min Pixel Clock PLL Output", type: "c1ms"},
					{offset: 0x32, name: "LCD Max Pixel Clock PLL Output", type: "c1ms"},
					{offset: 0x34, name: "3D Acceleration Engine Clock", type: "c10kl"},
					{offset: 0x38, name: "Min Pixel Clock Output", type: "c10kl"},
					{offset: 0x3C, name: "Min Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x3E, name: "Max Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x40, name: "Min Engine Clock Output", type: "c10ks"},
					{offset: 0x42, name: "Min Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x44, name: "Max Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x46, name: "Min Memory Clock Output", type: "c10ks"},
					{offset: 0x48, name: "Max Pixel Clock", type: "c10ks"},
					{offset: 0x4A, name: "Min Pixel Clock PLL Input", type: "c10ks"},
					{offset: 0x4C, name: "Max Pixel Clock PLL Input", type: "c10ks"},
					//{offset: 0x4E, name: "Min Pixel Clock Output", type: "c10ks"},
					{offset: 0x50, name: "Firmware Capability", type:"uhw"}, // todo: decode
					{offset: 0x52, name: "Reference Clock", type: "c10ks"},
					{offset: 0x54, name: "RTS PM4 Starting Location in ROM", type:"uhw"},
					{offset: 0x56, name: "RTS PM4 Packets", type:"uhb"},
					{offset: 0x57, name: "Design ID", type:"uhb"},
					{offset: 0x58, name: "Memory Module ID", type:"uhb"},
					];
					break;
				default:
					clog("unknown version: "+f+"."+c);
					break;
			}
			break;
		case 2:
			switch(c) {
				case 1:
					r = [
					{offset: 0x08, name: "Default Engine Clock", type: "c10kl"},
					{offset: 0x0C, name: "Default Memory Clock", type: "c10kl"},
					//{offset: 0x10, name: "Driver Target Engine Clock", type: "c10kl"},
					//{offset: 0x14, name: "Driver Target Memory Clock", type: "c10kl"},
					{offset: 0x18, name: "Max Engine Clock PLL Output", type: "c10kl"},
					{offset: 0x1C, name: "Max Memory Clock PLL Output", type: "c10kl"},
					{offset: 0x20, name: "Max Pixel Clock PLL Output", type: "c10kl"},
					{offset: 0x24, name: "Binary Altered Info", type: "c10kl"},
					{offset: 0x28, name: "Default Disp Engine Clock", type: "c10kl"},
					//{offset: 0x2C, name: "ASIC Max Temperature", type: "uhb"},
					{offset: 0x2D, name: "Min Allowed BL Level", type: "uhb"},
					{offset: 0x2E, name: "Boot up VDDC Voltage", type: "vmv"},
					{offset: 0x30, name: "LCD Min Pixel Clock PLL Output", type: "c1ms"},
					{offset: 0x32, name: "LCD Max Pixel Clock PLL Output", type: "c1ms"},
					//{offset: 0x34, name: "3D Acceleration Engine Clock", type: "c10kl"},
					{offset: 0x38, name: "Min Pixel Clock Output", type: "c10kl"},
					{offset: 0x3C, name: "Min Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x3E, name: "Max Engine Clock PLL Input", type: "c10ks"},
					{offset: 0x40, name: "Min Engine Clock Output", type: "c10ks"},
					{offset: 0x42, name: "Min Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x44, name: "Max Memory Clock PLL Input", type: "c10ks"},
					{offset: 0x46, name: "Min Memory Clock Output", type: "c10ks"},
					{offset: 0x48, name: "Max Pixel Clock", type: "c10ks"},
					{offset: 0x4A, name: "Min Pixel Clock PLL Input", type: "c10ks"},
					{offset: 0x4C, name: "Max Pixel Clock PLL Input", type: "c10ks"},
					//{offset: 0x4E, name: "Min Pixel Clock Output", type: "c10ks"},
					{offset: 0x50, name: "Firmware Capability", type:"uhw"}, // todo: decode
					{offset: 0x52, name: "Core Reference Clock", type: "c10ks"},
					{offset: 0x54, name: "Memory Reference Clock", type:"c10ks"},
					{offset: 0x56, name: "Uniphy DP Mode Ext Clock", type:"c10ks"},
					{offset: 0x58, name: "Memory Module ID", type:"uhb"},
					];
					break;
				case 2:
					r = [
					{offset: 0x08, name: "Default Engine Clock", type: "c10kl"},
					{offset: 0x0C, name: "Default Memory Clock", type: "c10kl"},
					{offset: 0x10, name: "SPLL Output Freq", type: "c10kl"},
					{offset: 0x14, name: "GPUPLL Output Freq", type: "c10kl"},
					//{offset: 0x18, name: "Max Engine Clock PLL Output", type: "c10kl"},
					//{offset: 0x1C, name: "Max Memory Clock PLL Output", type: "c10kl"},
					{offset: 0x20, name: "Max Pixel Clock PLL Output", type: "c10kl"},
					{offset: 0x24, name: "Binary Altered Info", type: "c10kl"},
					{offset: 0x28, name: "Default Disp Engine Clock", type: "c10kl"},
					//{offset: 0x2C, name: "ASIC Max Temperature", type: "uhb"},
					{offset: 0x2D, name: "Min Allowed BL Level", type: "uhb"},
					{offset: 0x2E, name: "Boot up VDDC Voltage", type: "vmvs"},
					{offset: 0x30, name: "LCD Min Pixel Clock PLL Output", type: "c1ms"},
					{offset: 0x32, name: "LCD Max Pixel Clock PLL Output", type: "c1ms"},
					//{offset: 0x34, name: "3D Acceleration Engine Clock", type: "c10kl"},
					{offset: 0x38, name: "Min Pixel Clock Output", type: "c10kl"},
					{offset: 0x3C, name: "Remote Display Config", type: "uhb"},
					//{offset: 0x3E, name: "Max Engine Clock PLL Input", type: "c10ks"},
					//{offset: 0x40, name: "Min Engine Clock Output", type: "c10ks"},
					//{offset: 0x42, name: "Min Memory Clock PLL Input", type: "c10ks"},
					//{offset: 0x44, name: "Max Memory Clock PLL Input", type: "c10ks"},
					//{offset: 0x46, name: "Min Memory Clock Output", type: "c10ks"},
					//{offset: 0x48, name: "Max Pixel Clock", type: "c10ks"},
					{offset: 0x4A, name: "Min Pixel Clock PLL Input", type: "c10ks"},
					{offset: 0x4C, name: "Max Pixel Clock PLL Input", type: "c10ks"},
					{offset: 0x4E, name: "Boot up VDDCI Voltage", type: "vmvs"},
					{offset: 0x50, name: "Firmware Capability", type:"uhw"}, // todo: decode
					{offset: 0x52, name: "Core Reference Clock", type: "c10ks"},
					{offset: 0x54, name: "Memory Reference Clock", type:"c10ks"},
					{offset: 0x56, name: "Uniphy DP Mode Ext Clock", type:"c10ks"},
					{offset: 0x58, name: "Memory Module ID", type:"uhb"},
					{offset: 0x59, name: "Cooling Solution ID", type:"uhb"}, // todo: decode, 0 = air, 1 = liquid
					{offset: 0x5A, name: "Product Branding", type: "uhb"},
					{offset: 0x5C, name: "Boot up MVDDC Voltage", type: "vmvs"},
					{offset: 0x5E, name: "Boot up VDDGFX Voltage", type: "vmvs"},
					];
					break;
				default:
					clog("unknown version: "+f+"."+c);
					break;
			}
			break;
		default:
			clog("unknown format rev "+f);
			break;
	}
	return r;
}

function parse_lcd() {
	var s = "";
	var toff = rom16(pointers.data+0x10);
	var f = rom8(toff+0x02);
	var c = rom8(toff+0x03);
	var t = [];
	
	switch(f) {
		case 1:
			switch(c) {
				case 1:
					t = [
					{offset:0x00, name: "Common Header", type:"ch"},
					{offset:0x04, name: "LCD Timing", type:"dtd"},
					{offset:0x20, name: "Mode Patch Table Offset", type:"uhw"},
					{offset:0x22, name: "Supported Refresh Rate", type:"uhw"},
					{offset:0x24, name: "Off Delay in ms", type: "uhw"},
					{offset:0x26, name: "Power Sequence Dig Onto DE in 10 ms", type:"uhb"},
					{offset:0x27, name: "Power Sequence DE to BL on in 10 ms", type:"uhb"},
					{offset:0x28, name: "LVDS Misc", type:"uhb"},
					{offset:0x29, name: "Panel Default Refresh Rate", type:"uhb"},
					{offset:0x2A, name: "Panel Identification", type:"uhb"},
					{offset:0x2B, name: "SS Id", type:"uhb"},
					];
					break;
				case 2:
					t = [
					{offset:0x00, name: "Common Header", type:"ch"},
					{offset:0x04, name: "LCD Timing", type:"dtd"},
					{offset:0x20, name: "Ext Info Table Offset", type:"uhw"},
					{offset:0x22, name: "Supported Refresh Rate", type:"uhw"},
					{offset:0x24, name: "Off Delay in ms", type: "uhw"},
					{offset:0x26, name: "Power Sequence Dig Onto DE in 10 ms", type:"uhb"},
					{offset:0x27, name: "Power Sequence DE to BL on in 10 ms", type:"uhb"},
					{offset:0x28, name: "LVDS Misc", type:"uhb"},
					{offset:0x29, name: "Panel Default Refresh Rate", type:"uhb"},
					{offset:0x2A, name: "Panel Identification", type:"uhb"},
					{offset:0x2B, name: "SS Id", type:"uhb"},
					{offset:0x2C, name: "LCD Vendor", type:"uhw"},
					{offset:0x2E, name: "LCD Product", type:"uhw"},
					{offset:0x30, name: "LCD Panel Special Handling Cap", type:"uhb"},
					{offset:0x31, name: "Panel Info Size", type:"uhb"},
					];
					break;
				case 3:
					t = [
					{offset:0x00, name: "Common Header", type:"ch"},
					{offset:0x04, name: "LCD Timing", type:"dtd"},
					{offset:0x20, name: "Ext Info Table Offset", type:"uhw"},
					{offset:0x22, name: "Supported Refresh Rate", type:"uhw"},
					//{offset:0x24, name: "Off Delay in ms", type: "uhw"},
					//{offset:0x26, name: "Power Sequence Dig Onto DE in 10 ms", type:"uhb"},
					//{offset:0x27, name: "Power Sequence DE to BL on in 10 ms", type:"uhb"},
					{offset:0x28, name: "LVDS Misc", type:"uhb"},
					{offset:0x29, name: "Panel Default Refresh Rate", type:"uhb"},
					{offset:0x2A, name: "Panel Identification", type:"uhb"},
					{offset:0x2B, name: "SS Id", type:"uhb"},
					{offset:0x2C, name: "LCD Vendor", type:"uhw"},
					{offset:0x2E, name: "LCD Product", type:"uhw"},
					{offset:0x30, name: "LCD Panel Special Handling Cap", type:"uhb"},
					{offset:0x31, name: "Panel Info Size", type:"uhb"},
					{offset:0x32, name: "Backlight PWM frequency", type:"uhw"},
					{offset:0x34, name: "Power Sequence DIGON to DE in 4 ms", type:"uhb"},
					{offset:0x35, name: "Power Sequence DE to VARY_BL in 4 ms", type:"uhb"},
					{offset:0x36, name: "Power Sequence VARY_BL to DE in 4 ms", type:"uhb"},
					{offset:0x37, name: "Power Sequence DE to DIGON in 4 ms", type:"uhb"},
					{offset:0x38, name: "Off Delay in 4 ms", type:"uhb"},
					{offset:0x39, name: "Power Sequence VARY_BL to BLON in 4 ms", type:"uhb"},
					{offset:0x3A, name: "Power Sequence BLON to VARY_BL in 4 ms", type:"uhb"},
					{offset:0x3C, name: "DPCD_eDP_CONFIGURATION_CAP", type:"uhb"},
					{offset:0x3D, name: "DPCD_MAX_LINK_RATE", type:"uhb"},
					{offset:0x3E, name: "DPCD_MAX_LANE_COUNT", type:"uhb"},
					{offset:0x3F, name: "DPCD_MAX_DOWNSPREAD", type:"uhb"},
					{offset:0x40, name: "Max Pixel Clock in single link", type:"uhb"},
					{offset:0x41, name: "eDP to LVDS RX Id", type:"uhb"},
					];
					break;
				default:
					clog("unknown lcd table version: "+f+"."+c);
					break;
			}
			break;
		default:
			clog("unknown lcd format rev: "+f);
			break;
	}
	s+=print_rom_table(t,toff);
	return s;
}

function gen_palette(pdptr) {
	var pmax = ((rom16(pdptr)-4)/3);
	var s = "Palette version: "+rom8(pdptr+2)+"."+rom8(pdptr+3)+"<br>Palette count: "+pmax;
	var r,g,b,ir,ig,ib;
	var idx = 0;
	
	pdptr+=4;
	s+="<table>";
	for (var i=0;i<16;i++) {
		s+="<tr>";
		for (var j=0;j<16;j++) {
			r = rom8(pdptr+idx)*4;
			g = rom8(pdptr+idx+1)*4;
			b = rom8(pdptr+idx+2)*4;
			ir = 255-r;
			ig = 255-g;
			ib = 255-b;
			s+="<td style=\"background-color:#"+pad8(r)+pad8(g)+pad8(b)+"; color:#"+pad8(ir)+pad8(ig)+pad8(ib)+"; padding:1px; border:1px;\">"+pad8((i*16)+j)+"</td>";
			idx+=3;
			if ((idx/3)>=pmax) break;
		}
		if ((idx/3)>=pmax) break;
		s+="</tr>";
	}
	s+="</table>";
	return s;
}