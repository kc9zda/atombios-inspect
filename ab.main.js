/*
Copyright 2018 Joseph Havens

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var rom;
var pointers = {};
var toc = [];

function init() {
	var params = ["BIOS ROM Image: "+createFileInput("olf"), createButton("Load","init2();","olc","success")];
	var data = createPanel("Setup",createUnorderedList(params),"setuppan",{vcenter: true, nbm: true});
	setOverlay(data);
	show_overlay();
}
	
function init2() {
	//get_file_as_binary(gf("olf",0));
	if (gf("olf",0)==undefined) return;
	var reader = new FileReader();
	reader.onload = ldrom;
	reader.readAsArrayBuffer(gf("olf",0));
	hide_overlay();
}

function ldrom(e) {
	var ab = e.target.result;
	rom = new DataView(ab);
	parse_rom();
}

function gf(id,ix) {
	return ge(id).files[ix];
}

function parse_rom() {
	var c = "";
	
	//c+="BIOS Magic: "+rom16(0).toString(16);
	c+="<h3>ROM Information:</h3><div id=\"tbl_main\">";
	c+=parse_main_rom();
	c+=gen_header("ATOM Table Information","tbl_atom");
	c+=parse_atom();
	c+=gen_header("Command Table Information","tbl_cmd");
	c+=parse_commands();
	c+=gen_header("Data Table Information","tbl_data");
	c+=parse_data();
	c+=gen_header("PCI Info","tbl_pci");
	c+=gen_hexdump(rom16(pointers.atom+0x1c),64);
	c+="<hr>";
	c+=disassemble_commands();
	c+="</div>";
	c = gen_toc()+c;
	si("container",c);
}

function clog(m) {
	console.log(m);
}

function si(id,c) {
	ge(id).innerHTML = c;
}

function rom_fixed_string(o,l) {
	var s="";
	
	for (var i=0;i<l;i++) {
		s+=String.fromCharCode(rom8(o+i));
	}
	return s;
}

function rom32(i) {
	return rom.getUint32(i,true);
}

function rom16(i) {
	return rom.getUint16(i,true);
}

function rom8(i) {
	return rom.getUint8(i,true);
}

function parse_main_rom() {
	var s="";
	var t = [
		{offset: 0, name: "BIOS Magic", type:"uhw"},
		{offset: 0x30, name: "ATI Magic", type:"fs", length:10},
		{offset: 0x48, name: "ATOM Base", type:"uhw"},
		];
	
	s = print_rom_table(t);
	pointers.atom = rom16(0x48);
	return s;
}

function print_rom_table(t,o) {
	var s="";
	
	o = o || 0;
	s+="<table class=\"table\"><tr><th>Offset</th><th>Name</th><th>Value</th></tr>";
	for (var i=0;i<t.length;i++) {
		s += print_rom_table_entry(t[i],o);
	}
	s+="</table>"
	return s;
}

function print_rom_table_entry(te,o) {
	return "<tr><td>0x"+(te.offset).toString(16)+" (0x"+((o+te.offset).toString(16))+")</td><td>"+te.name+"</td><td>"+print_rom_table_get_entry(te,o)+"</td></tr>";
}

function print_rom_table_get_entry(te,o) {
	
	o+=te.offset;
	switch(te.type) {
		case "uhw": // Unsigned Hex Word
			return rom16(o).toString(16);
		case "ch":
			return "Size: "+rom16(o)+"<br> Format Rev: "+rom8(o+2).toString(16)+"<br> Content Rev: "+rom8(o+3).toString(16);
		case "fs":
			return rom_fixed_string(o,te.length);
		case "uhb":
			return rom8(o).toString(16);
		case "uhl":
			return rom32(o).toString(16);
		case "c10kl":
			if (rom32(o) > 100) return (rom32(o)/100)+" MHz";
			else return (rom32(o)*10)+" kHz";
		case "vmvs":
			return (rom16(o)+" mV");
		case "c1ms":
			return (rom16(o)+" MHz");
		case "c10ks":
			if (rom16(o) > 100) return (rom16(o)/100)+" MHz";
			else return (rom16(o)*10)+" kHz";
		case "dtd":
			var s = "";
			
			s+="Pixel Clock: "+rom16(o).toString(16)+"<br>";
			s+="H Active: "+rom16(o+2).toString(16)+"<br>";
			s+="H Blanking Time: "+rom16(o+4).toString(16)+"<br>";
			s+="V Active: "+rom16(o+8).toString(16)+"<br>";
			s+="V Blanking Time: "+rom16(o+10).toString(16)+"<br>";
			s+="HSync Offset: "+rom16(o+12).toString(16)+"<br>";
			s+="HSync Width: "+rom16(o+14).toString(16)+"<br>";
			s+="VSync Offset: "+rom16(o+16).toString(16)+"<br>";
			s+="VSync Width: "+rom16(o+18).toString(16)+"<br>";
			s+="Image H Size: "+rom16(o+20).toString(16)+"<br>";
			s+="Image V Size: "+rom16(o+22).toString(16)+"<br>";
			s+="H Border: "+rom8(o+23).toString(16)+"<br>";
			s+="V Border: "+rom8(o+24).toString(16)+"<br>";
			s+="Mode Misc Info: "+rom16(o+26).toString(16)+"<br>";
			s+="Internal Mode Number: "+rom8(o+27).toString(16)+"<br>";
			s+="Refresh Rate: "+rom8(o+28).toString(16);
			return s;
		default:
			clog("unknown table entry type: "+te.type);
			return "UNKNOWN";
			break;
	}
}

function parse_atom() {
	var s="";
	var t = [
		{offset: 0x00, name: "Common Header", type:"ch"},
		{offset: 0x04, name: "ATOM Magic", type:"fs", length: 4},
		{offset: 0x08, name: "BIOS Runtime Segment", type:"uhw"},
		{offset: 0x0A, name: "PM Info Offset", type:"uhw"},
		{offset: 0x0C, name: "Config Filename offset", type:"uhw"},
		{offset: 0x0E, name: "CRC Block Offset", type:"uhw"},
		{offset: 0x10, name: "Name string offset", type:"uhw"},
		{offset: 0x12, name: "Int 10 Offset", type:"uhw"},
		{offset: 0x14, name: "PCI Bus Device Init Code", type:"uhw"},
		{offset: 0x16, name: "IO Base address", type:"uhw"},
		{offset: 0x18, name: "Subsystem Vendor", type:"uhw"},
		{offset: 0x1A, name: "Subsystem ID", type:"uhw"},
		{offset: 0x1C, name: "<a href=\"#tbl_pci\">PCI Info offset</a>", type:"uhw"},
		{offset: 0x1E, name: "<a href=\"#tbl_cmd\">Command table base</a>", type:"uhw"},
		{offset: 0x20, name: "<a href=\"#tbl_data\">Data table base</a>", type:"uhw"},
		{offset: 0x22, name: "Extended function code", type:"uhb"}
		];
		
	s = print_rom_table(t,pointers.atom);
	pointers.command = rom16(pointers.atom+0x1E);
	pointers.data = rom16(pointers.atom+0x20);
	return s;
}

function gen_header(n,i) {
	toc.push({id:i, text:n});
	return "</div><br><div id=\""+i+"\"><h3>"+n+":</h3>";
}

function gen_hexdump(o,l) {
	var i=0;
	var s="<code>";
	var c='.';
	
	while (i<l) {
		s+="0x"+pad16(o+i)+" | ";
		for (var j=0;j<16;j++) {
			if (j==8) s+="&nbsp;";
			s+=pad8(rom8(o+i+j))+" ";
			}
		s+="| ";
		for (var j=0;j<16;j++) {
			if (j==8) s+="&nbsp;";
			if ((rom8(o+i+j)<32) || (rom8(o+i+j)>0x7f)) c='.';
			else c = String.fromCharCode(rom8(o+i+j));
			s+=c;
			}
		s+="<br>";
		i+=16;
		}
	s+="</code>";
	return s;
}

function pad16(v) {
	return ("0000" + v.toString(16)).substr(-4);
}

function pad8(v) {
	return ("00" + v.toString(16)).substr(-2);
}

function table_link(txt,id) {
	return "<a href=\"#"+id+"\">"+txt+"</a>";
}

function gen_toc() {
	var s = "<div id=\"toc\"><ul>";
	
	s+="<h3>Table of Contents:</h3>";
	for (var i=0;i<toc.length;i++) {
		if (toc[i].hasChildren) {
			s+="<li><a href=\"#"+toc[i].id+"\">"+toc[i].text+"</a>";
			s+="</li>";
		} else {
			s+="<li><a href=\"#"+toc[i].id+"\">"+toc[i].text+"</a></li>";
		}
	}
	s+="</ul></div>";
	return s;
}