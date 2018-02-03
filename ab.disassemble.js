/*
Copyright 2018 Joseph Havens

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var disassemblers = [
	d_unk,d_move,d_move,d_move,d_move,d_unk,d_unk,d_and, // 0x00
	d_and,d_and,d_unk,d_unk,d_unk,d_or,d_or,d_or, // 0x08
	d_unk,d_unk,d_unk,d_unk,d_shift_left,d_shift_left,d_unk,d_unk, // 0x10
	d_unk,d_unk,d_shift_right,d_shift_right,d_unk,d_unk,d_unk,d_unk, // 0x18
	d_mul,d_mul,d_unk,d_unk,d_unk,d_unk,d_unk,d_div, // 0x20
	d_unk,d_unk,d_unk,d_add,d_add,d_add,d_unk,d_unk, // 0x28
	d_unk,d_sub,d_sub,d_sub,d_unk,d_unk,d_unk,d_setport, // 0x30
	d_unk,d_unk,d_setregblock,d_setfbbase,d_compare,d_compare,d_compare,d_unk, // 0x38
	
	d_unk,d_unk,d_switch,d_jump,d_jump,d_jump,d_jump,d_jump, // 0x40
	d_unk,d_jump,d_test,d_test,d_test,d_unk,d_unk,d_unk, // 0x48
	d_delay,d_delay,d_calltable,d_unk,d_clear,d_clear,d_clear,d_clear, //0x50
	d_unk,d_unk,d_unk,d_eot,d_mask,d_unk,d_mask,d_unk, // 0x58
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_setdatablock,d_unk, // 0x60
	d_unk,d_xor,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk, // 0x68
	d_unk,d_unk,d_unk,d_unk,d_shr,d_shr,d_unk,d_unk, // 0x70
	d_unk,d_unk,d_processds,d_unk,d_unk,d_unk,d_unk,d_unk, // 0x78
	
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,
	d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk,d_unk
	];
	
var arg_types = [
	"REG",
	"PS",
	"WS",
	"FB",
	"ID",
	"IMM",
	"PLL",
	"MC"];
	
var dst_to_src = [
	[0,0,0,0],
	[1,2,3,0],
	[1,2,3,0],
	[1,2,3,0],
	[4,5,6,7],
	[4,5,6,7],
	[4,5,6,7],
	[4,5,6,7]
	];
	
var aligns = [
	"[31:0]",
	"[15:0]",
	"[23:8]",
	"[31:16]",
	"[7:0]",
	"[15:8]",
	"[23:16]",
	"[31:24]"
	];
	
var data_table_names = [
	"UtilityPipeline",
	"MultimediaCapabilityInfo",
	"MultimediaConfigInfo",
	"StandardVesa_Timing",
	"FirmwareInfo",
	"PaletteData",
	"LCD_Info",
	"DIGTransmitterInfo",
	"AnalogTV_Info",
	"SupportedDevicesInfo",
	"GPIO_I2C_Info",
	"VRAM_UsageByFirmware",
	"GPIO_Pin_LUT",
	"VESA_ToInternalModeLUT",
	"ComponentVideoInfo",
	"PowerPlayInfo",
	"GPUVirtualizationInfo",
	"SaveRestoreInfo",
	"PPLL_SS_Info",
	"OemInfo",
	"XTMDS_Info",
	"MclkSS_Info",
	"Object_header",
	"IndirectIOAccess",
	"MC_InitParameter",
	"ASIC_VDDC_Info",
	"ASIC_InternalSS_Info",
	"TV_VideoMode",
	"VRAM_Info",
	"MemoryTrainingInfo",
	"IntegratedSystemInfo",
	"ASIC_ProfilingInfo",
	"VoltageObjectInfo",
	"PowerSourceInfo",
	];
	
var def_dst = [
	0, 0, 1, 2, 0, 1, 2, 3
	];

function disassemble_commands() {
	var s = "";
	
	for (var i=0;i<command_names.length;i++) {
		s+=disassemble_command(i);
	}
	return s;
}

function disassemble_command(i) {
	var o = rom16(pointers.command+4+(i*2));
	var s = "";
	
	if (o==0) return "";
	s+="<div id=\"cmd"+i+"\">";
	s+="<h4>Command "+command_names[i]+"</h4>"
	s+="Command Length: "+rom16(o)+" (end = 0x"+(o+rom16(o)-1).toString(16)+"), ";
	s+="WS: "+rom8(o+4)+", ";
	s+="PS: "+rom8(o+5)+", ";
	clog("disassembling "+command_names[i]);
	s+=disassemble_bytecode(o+6,rom16(o));
	s+="</div><br>";
	return s;
}

function disassemble_bytecode(off, len) {
	var ctx = {};

	ctx.offset = off;
	ctx.length = len;
	ctx.listings = [];
	ctx.index = 0;
	while (1) {
		ctx = disassemble_op(ctx);
		ctx.debug = "";
		if (ctx.abort) break;
		if (!(ctx.index < (ctx.length-6))) break;
	}
	return format_disassembly(ctx);
}

function format_disassembly(ctx) {
	var s = "";
	
	s+="<table class=\"table\">";
	s+="<tr><th>Offset</th><th>Opcode(s)</th><th>Disassembly</th></tr>";
	for (var i=0;i<ctx.listings.length;i++) {
		s+="<tr><td>0x"+ctx.listings[i].offset+" (0x"+(ctx.offset+ctx.listings[i].offset).toString(16)+")</td><td>"+format_disassembly_bytes(ctx.listings[i].opcodes)+"</td><td>"+ctx.listings[i].disassembly+"</td></tr>";
	}
	s+="</table>";
	return s;
}

function format_disassembly_bytes(opcodes) {
	var s="";
	
	if (opcodes.length > 12) {
		return s="&lt;"+opcodes.length+" bytes&gt;";
	}
	s+=("00" + opcodes[0].toString(16)).substr(-2);
	for (var i=1;i<opcodes.length;i++) {
		s+=" "+("00" + opcodes[i].toString(16)).substr(-2);
	}
	return s;
}

function disassemble_op(ctx) {
	var i = rom8(ctx.offset+ctx.index);
	//clog(i);
	return disassemblers[i](ctx);
}

function opcode_bytes(ctx,l) {
	var b = [];
	
	for (var i=0;i<l;i++) {
		b.push(rom8(ctx.offset+ctx.index+i));
	}
	return b;
}

function decode_attr(ctx) {
	var v = rom8(ctx.offset + ctx.index+1)
	
	return "0x"+v.toString(16)+"("+arg_types[v&7]+")";
}

function d_get_src(ctx,attr) {
	var idx, align, arg;
	
	arg = attr&7;
	align = (attr>>3)&7;
	ctx.src = {};
	ctx.src.arg = arg;
	ctx.src.align = align;
	ctx.src.index = -1;
	switch(arg) {
		case 1: // ARG_PS
		case 2: // ARG_WS
		case 3: // ARG_FB
			ctx.src.index = rom8(ctx.offset+ctx.index);
			ctx.index++;
			break;
		case 0: // ARG_REG
		case 4: // ARG_ID
			ctx.src.index = rom16(ctx.offset+ctx.index);
			ctx.index+=2;
			break;
		case 5: // ARG_IMM
			ctx = d_get_src_direct(ctx,align);
			ctx.src.index = ctx.temp;
			break;
		default:
			clog("unknown arg: "+arg);
			break;
	}
	return ctx;
}

function d_get_dst(ctx,arg,attr) {
	var idx, align;
	
	attr = arg | dst_to_src[(attr>>3)&7][(attr>>6)&3]<<3;
	//arg = attr&7;
	align = (attr>>3)&7;
	ctx.dst = {};
	ctx.dst.arg = arg;
	ctx.dst.align = align;
	ctx.dst.index = -1;
	switch(arg) {
		case 1: // ARG_PS
		case 2: // ARG_WS
		case 3: // ARG_FB
			ctx.dst.index = rom8(ctx.offset+ctx.index);
			ctx.index++;
			break;
		case 0: // ARG_REG
			ctx.dst.index = rom16(ctx.offset+ctx.index);
			ctx.index+=2;
			break;
		default:
			clog("unknown arg: "+arg);
			break;
	}
	return ctx;
}

function decode_src_dst(ctx) {
	var s="";
	
	//s+="DST: arg = "+ctx.dst.arg+" align="+ctx.dst.align+" index="+ctx.dst.index+" ";
	//s+="SRC: arg = "+ctx.src.arg+" align="+ctx.src.align+" index="+ctx.src.index;
	//s = arg_types[ctx.dst.arg]+"[0x"+ctx.dst.index.toString(16)+"]"+aligns[ctx.dst.align]+", "+arg_types[ctx.src.arg]+"[0x"+ctx.src.index.toString(16)+"]"+aligns[ctx.src.align];
	s = decode_operand(ctx.dst)+", "+decode_operand(ctx.src);
	return s;
}

function opcode_bytes2(s,l) {
	var b = [];
	
	for (var i=0;i<l;i++) {
		b.push(rom8(s+i));
	}
	return b;
}

function decode_operand(op) {
	return arg_types[op.arg]+"[0x"+op.index.toString(16)+"]"+aligns[op.align];
}

function d_get_src_direct(ctx, align) {
	switch(align) {
		case 0:
			ctx.temp = rom32(ctx.offset+ctx.index);
			ctx.index+=4;
			break;
		case 1:
		case 2:
		case 3:
			ctx.temp = rom16(ctx.offset+ctx.index);
			ctx.index+=2;
			break;
		case 4:
		case 5:
		case 6:
		case 7:
			ctx.temp = rom8(ctx.offset+ctx.index);
			ctx.index++;
			break;
	}
	return ctx;
}

/// OPCODES...

function d_unk(ctx) {
	ctx.listings.push({offset: ctx.index, opcodes:[rom8(ctx.offset+ctx.index)], disassembly: ("db 0x"+rom8(ctx.offset+ctx.index).toString(16))});
	ctx.index++;
	ctx.abort = true;
	return ctx;
}

function d_eot(ctx) {
	ctx.listings.push({offset: ctx.index, opcodes:[rom8(ctx.offset+ctx.index)], disassembly: ("endtable")});
	ctx.index++;
	//ctx.abort = true;
	return ctx;
}

function d_calltable(ctx) {
	var o = {};
	var t = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	o.opcodes = [0x52, rom8(ctx.offset+ctx.index+1)];
	o.disassembly = "calltable 0x"+t.toString(16)+" (<a href=\"#cmd"+t+"\">"+command_names[t]+"</a>)";
	ctx.listings.push(o);
	ctx.index+=2;
	return ctx;
}

function d_restorereg(ctx) {
	var o = {};
	
	o.offset = ctx.index;
	o.opcodes = [rom8(ctx.offset+ctx.index)];
	o.disassembly = "restorereg";
	ctx.listings.push(o);
	ctx.index++;
	return ctx;
}

function d_setdatablock(ctx) {
	var o = {};
	var i = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	o.opcodes = opcode_bytes(ctx,2);
	o.disassembly = "setdatablock";
	switch(i) {
		case 0:
			o.disassembly = "setdatablock ROM_START";
			break;
		case 255:
			o.disassembly = "setdatablock CMD_DATA";
			break;
		default:
			o.disassembly = "setdatablock "+i+" (<a href=\"#dt"+i+"\">"+data_table_names[i]+"</a>)";
			break;
	}
	ctx.listings.push(o);
	ctx.index+=2;
	return ctx;
}

function d_move(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x01:
			arg = 0; // ARG_REG
			break;
		case 0x02:
			arg = 1; // ARG_PS
			break;
		case 0x03:
			arg = 2; // ARG_WS
			break;
		case 0x04:
			arg = 3; // ARG_FB
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "move "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_or(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x0d:
			arg = 0; // ARG_REG
			break;
		case 0x0e:
			arg = 1; // ARG_PS
			break;
		case 0x0f:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "or "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_test(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x4a:
			arg = 0; // ARG_REG
			break;
		case 0x4b:
			arg = 1; // ARG_PS
			break;
		case 0x4c:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "test "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_jump(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var tgt = rom16(ctx.offset+ctx.index+1);
	var cond = "";
	
	o.offset = ctx.index;
	ctx.index+=3;
	switch(op) {
		case 0x44:
			cond = ".eq";
			break;
		case 0x45:
			cond = ".lt";
			break;
		case 0x46:
			cond = ".gt";
			break;
		case 0x47:
			cond = ".beq";
			break;
		case 0x49:
			cond = ".ne";
			break;
	}
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	o.disassembly = "jump"+cond+" 0x"+(ctx.offset+tgt-6).toString(16);
	ctx.listings.push(o);
	return ctx;
}

function d_setport(ctx) {
	var o ={};
	var op = rom8(ctx.offset+ctx.index);
	
	o.offset = ctx.index;
	ctx.index++;
	switch(op) {
		case 0x37:
			var port = rom16(ctx.offset+ctx.index);
			ctx.index+=2;
			if (port == 0) {
				o.disassembly = "setport.ati MMIO";
			} else {
				o.disassembly = "setport.ati IIO 0x"+port.toString(16);
			}
		break;
	}
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	ctx.listings.push(o);
	return ctx;
}

function d_sub(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x31:
			arg = 0; // ARG_REG
			break;
		case 0x32:
			arg = 1; // ARG_PS
			break;
		case 0x33:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "sub "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_and(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x07:
			arg = 0; // ARG_REG
			break;
		case 0x08:
			arg = 1; // ARG_PS
			break;
		case 0x09:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "and "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_clear(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	switch(op) {
		case 0x54:
			arg = 0; // ARG_REG
			break;
		case 0x55:
			arg = 1; // ARG_PS
			break;
		case 0x56:
			arg = 2; // ARG_WS
			break;
		case 0x57:
			arg = 3; // ARG_FB
			break;
	}
	attr &= 0x38;
	attr |= def_dst[attr>>3]<<6;
	o.offset = ctx.index;
	ctx.index+=2;
	ctx = d_get_dst(ctx,arg,attr);
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	o.disassembly = "clear "+decode_operand(ctx.dst);
	ctx.listings.push(o);
	return ctx;
}

function d_shr(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x74:
			arg = 1;
			break;
		case 0x75:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "shr "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_add(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x2b:
			arg = 0;
			break;
		case 0x2c:
			arg = 1; // ARG_PS
			break;
		case 0x2d:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "add "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_div(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x27:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "div "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_mask(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	var mask;
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x5c:
			arg = 0; // ARG_REG
			break;
		case 0x5e:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src_direct(ctx,(attr>>3&7));
	mask = ctx.temp;
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "mask "+decode_src_dst(ctx)+","+mask.toString(16); // todo: split dst and src and put the mask in the middle
	ctx.listings.push(o);
	return ctx;
}

function d_compare(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x3c:
			arg = 0; // ARG_REG
			break;
		case 0x3d:
			arg = 1; // ARG_PS
			break;
		case 0x3e:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "compare "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_delay(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var ct = rom8(ctx.offset+ctx.index+1);
	var unit = "??";
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x50:
			unit = "ms";
			break;
		case 0x51:
			unit = "us";
			break;
	}
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	o.disassembly = "delay."+unit+" "+ct;
	ctx.listings.push(o);
	return ctx;
}

function d_shift_left(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	var shift;
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x14:
			arg = 1; // ARG_PS
			break;
		case 0x15:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src_direct(ctx, 4); // SRC_BYTE0
	shift = ctx.temp;
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "shl "+decode_operand(ctx.dst)+", "+shift;
	ctx.listings.push(o);
	return ctx;
}

function d_shift_right(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	var shift;
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x1a:
			arg = 1; // ARG_PS
			break;
		case 0x1b:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src_direct(ctx, 4); // SRC_BYTE0
	shift = ctx.temp;
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "shr "+decode_operand(ctx.dst)+", "+shift;
	ctx.listings.push(o);
	return ctx;
}

function d_switch(ctx) {
	var s = false;
	var attr = rom8(ctx.offset+ctx.index+1);
	
	/*o.offset = ctx.index;
	ctx.index+=2;
	ctx = d_get_src(ctx,attr);
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	o.disassembly = "switch.begin "+decode_operand(ctx.src);
	ctx.listings.push(o);*/
	ctx = d_switch_begin(ctx);
	while (!s) {
		ctx = d_switch_entry(ctx,attr);
		s = ctx.temp;
		}
	ctx = d_switch_end(ctx);
	return ctx;
}

function d_switch_begin(ctx) {
	var o = {};
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	ctx = d_get_src(ctx,attr);
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	o.disassembly = "switch.begin "+decode_operand(ctx.src);
	ctx.listings.push(o);
	return ctx;
}

function d_switch_entry(ctx, attr) {
	var target;
	var o = {};
	
	if (rom16(ctx.offset+ctx.index) != 0x5A5A) { // CASE_END_MAGIC
		if (rom8(ctx.offset+ctx.index) == 0x63) { // CASE_MAGIC
			o.offset = ctx.index;
			ctx.index++;
			ctx = d_get_src(ctx,(attr & 0x38) | 5); // ARG_IMM
			target = rom16(ctx.offset+ctx.index);
			ctx.index+=2;
			ctx.temp = false;
			o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
			o.disassembly = "switch.entry "+ctx.src.index+", 0x"+(ctx.offset+target-6).toString(16);
			ctx.listings.push(o);
			}
		} else {
			ctx.temp = true;
		}
	return ctx;
}

function d_switch_end(ctx) {
	var o = {};
	
	o.offset = ctx.index;
	ctx.index+=2;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	o.disassembly = "switch.end";
	ctx.listings.push(o);
	return ctx;
}

function d_mul(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x20:
			arg = 1; // ARG_PS
			break;
		case 0x21:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "mul "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}

function d_setregblock(ctx) {
	var o = {};
	
	o.offset = ctx.index;
	ctx.index++;
	o.disassembly = "setregblock 0x"+rom16(ctx.offset+ctx.index).toString(16);
	ctx.index+=2;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	ctx.listings.push(o);
	return ctx;
}

function d_processds(ctx) {
	var o = {};
	
	o.offset = ctx.index;
	ctx.index++;
	o.disassembly = "processds 0x"+(rom16(ctx.offset+ctx.index)).toString(16);
	ctx.index+=2+rom16(ctx.offset+ctx.index);
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	ctx.listings.push(o);
	return ctx;
}

function d_setfbbase(ctx) {
	var o = {};
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	ctx = d_get_src(ctx,attr);
	o.disassembly = "setfbbase "+decode_operand(ctx.src);
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	ctx.listings.push(o);
	return ctx;
}

function d_xor(ctx) {
	var o = {};
	var op = rom8(ctx.offset+ctx.index);
	var attr = rom8(ctx.offset+ctx.index+1);
	
	o.offset = ctx.index;
	ctx.index+=2;
	switch(op) {
		case 0x67:
			arg = 0; // ARG_REG
			break;
		case 0x68:
			arg = 1; // ARG_PS
			break;
		case 0x69:
			arg = 2; // ARG_WS
			break;
	}
	ctx = d_get_dst(ctx,arg,attr);
	ctx = d_get_src(ctx,attr);
	//ctx.abort = true;
	o.opcodes = opcode_bytes2(ctx.offset+o.offset,ctx.index-o.offset);
	//o.opcodes = [0xff];
	o.disassembly = "xor "+decode_src_dst(ctx);
	ctx.listings.push(o);
	return ctx;
}