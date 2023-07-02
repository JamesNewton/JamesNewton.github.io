var pc, ir, acc;
var acce, ire, pce, opcodee, operande;
var mode;
var deck, input, output;
var inlist, incard;
var intvar;
var pcd, accd, ird, opcoded, opd;
var line_MEM_ALU, line_ACC_ALU, line_ALU_ACC;
var line_IR_PC, line_IR_ADR, line_ACC_MEM;

console.log();

function init() {
  pc = 0;
  mode = 0;
  acce = document.getElementById('acc');
  ire = document.getElementById('ir');
  pce = document.getElementById('pc');
  deck = document.getElementById('deck');
  input = document.getElementById('input');
  output = document.getElementById('output');
  opcodee = document.getElementById('opcode');
  operande = document.getElementById('operand');

  pcd = document.getElementById('val-PC');
  accd = document.getElementById('val-ACC');
  ird = document.getElementById('val-IR');
  opcoded = document.getElementById('val-inst');
  opd = document.getElementById('val_OP');

  line_MEM_ALU = document.getElementById('line_MEM_ALU');
  line_ALU_ACC = document.getElementById('line_ALU_ACC');
  line_ACC_ALU = document.getElementById('line_ACC_ALU');
  line_IR_PC = document.getElementById('line_IR_PC');
  line_ACC_MEM = document.getElementById('line_ACC_MEM');
  line_IR_ADR = document.getElementById('line_IR_ADR');
  line_ACC_MEM = document.getElementById('line_ACC_MEM');
}

function memelem(addr) {
  return document.getElementById('mem' + addr);
}

function drawmem() {
  var r, c;

  document.writeln('<center>');
  document.writeln('<table align="right" cellpadding=0 cellspacing=0>');
  document.writeln('<caption>Memory</caption><tbody>');
  for (r = 0; r < 10; ++r) {
    document.writeln('<tr>');
    for (c = 0; c < 10; ++c) {
      document.writeln(
        '<td><sup>' +
          c +
          r +
          '</sup>' +
          '<input type="text" id="mem' +
          c +
          r +
          '" size=3 tabindex="' +
          c * 10 +
          r +
          1 +
          '"></td>'
      );
    }
    document.writeln('</tr>');
  }
  document.writeln('</tbody></table></center>');
  memelem('00').value = '001';
  memelem('99').value = '8--';
}

function ndig(val, n) {
  var ns;

  if (val < 0) {
    ns = '00000' + -val;
    return '-' + ns.substr(ns.length - n);
  } else {
    ns = '00000' + val;
    return ns.substr(ns.length - n);
  }
}

function doreset() {
  memelem(ndig(pc, 2)).style.backgroundColor = '#FFFFFF';
  pc = 0;
  memelem('00').style.backgroundColor = '#77FFBB';
  ire.value = '';
  acc = 0;
  acce.value = '0000';
  pce.value = '00';
  output.value = '';
  opcodee.value = '';
  operande.value = '';
}

function doload() {
  input.value = deck.value;
  inlist = deck.value.split('\n');
  incard = 0;
}

function doclearmem() {
  var i;

  memelem('00').value = '001';
  memelem('99').value = '8--';
  for (i = 1; i < 99; ++i) memelem(ndig(i, 2)).value = '';
}

function fetch(addr) {
  if (addr == 0) {
    memelem('00').value = '001';
    return 1;
  }
  return Number(memelem(ndig(addr, 2)).value);
}

function store(addr, val) {
  if (addr != 0) memelem(ndig(addr, 2)).value = ndig(val, 3);
}

function ladybug() {
  memelem(ndig(pc, 2)).style.backgroundColor = '#FFFFFF';
  pc = Number(pce.value);
  if (!Number.isInteger(pc)) {
    pc = 0;
    pce.value = ndig(pc, 2);
  }
  memelem(ndig(pc, 2)).style.backgroundColor = '#77FFBB';
  pcd.innerHTML = pce.value;
}

function dostep() {
  var op, addr;
  for (line of document.querySelectorAll('*[id^="line"]')) {
    line.style.strokeWidth = 2;
  }
  memelem(ndig(pc, 2)).style.backgroundColor = '#FFFFFF';
  pc = Number(pce.value);
  if (pc == 0) {
    ir = 1;
    memelem('00').value = '001';
  } else {
    ir = memelem(ndig(pc, 2)).value;
  }
  ire.value = ir;
  ird.innerHTML = ire.value;
  ++pc;
  op = Math.floor(ir / 100);
  addr = ir % 100;
  switch (op) {
    case 0: // INP - Input
      opcodee.value = 'INP';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      if (incard >= inlist.length || inlist[incard] == '') {
        mode = 0;
        pc = 0;
      } else {
        store(addr, Number(inlist[incard]));
        incard++;
        input.value = '';
        for (i = incard; i < inlist.length; ++i)
          input.value += inlist[i] + '\n';
      }
      break;
    case 1: // CLA - Clear and add (load)
      opcodee.value = 'CLA';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      acc = fetch(addr);
      acce.value = ndig(acc, 4);
      accd.innerHTML = acce.value;
      opd.innerHTML = ':';
      line_MEM_ALU.style.strokeWidth = 4;
      line_ALU_ACC.style.strokeWidth = 4;
      break;
    case 2: // ADD - Add
      opcodee.value = 'ADD';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      acc += fetch(addr);
      acce.value = ndig(acc, 4);
      accd.innerHTML = acce.value;
      opd.innerHTML = '+';
      line_MEM_ALU.style.strokeWidth = 4;
      line_ALU_ACC.style.strokeWidth = 4;
      line_ACC_ALU.style.strokeWidth = 4;
      break;
    case 3: // TAC - Test accumulator
      opcodee.value = 'TAC';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      if (acc < 0) {
        pc = addr;
        line_IR_PC.style.strokeWidth = 4;
      }
      opd.innerHTML = '';
      break;
    case 4: // SFT - Shift
      opcodee.value = 'SFT';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      lc = Math.floor(addr / 10);
      rc = addr % 10;
      for (i = 0; i < lc; ++i) acc = (acc * 10) % 10000;
      for (i = 0; i < rc; ++i) acc = Math.floor(acc / 10);
      acce.value = ndig(acc, 4);
      accd.innerHTML = acce.value;
      opd.innerHTML = '&lt;&gt;';
      line_MEM_ALU.style.strokeWidth = 4;
      line_ALU_ACC.style.strokeWidth = 4;
      line_ACC_ALU.style.strokeWidth = 4;
      break;
    case 5: // OUT - Output
      opcodee.value = 'OUT';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      output.value += ndig(fetch(addr), 3) + '\n';
      opd.innerHTML = '';
      break;
    case 6: // STO - Store
      opcodee.value = 'STO';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      store(addr, acc);
      opd.innerHTML = '';
      line_ACC_MEM.style.strokeWidth = 4;
      line_IR_ADR.style.strokeWidth = 4;
      break;
    case 7: // SUB - Subtract
      opcodee.value = 'SUB';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      acc -= fetch(addr);
      acce.value = ndig(acc, 4);
      accd.innerHTML = acce.value;
      opd.innerHTML = '-';
      line_MEM_ALU.style.strokeWidth = 4;
      line_ALU_ACC.style.strokeWidth = 4;
      line_ACC_ALU.style.strokeWidth = 4;
      break;
    case 8: // JMP - Jump
      opcodee.value = 'JMP';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      store(99, pc + 800);
      pc = addr;
      opd.innerHTML = '';
      line_IR_PC.style.strokeWidth = 4;
      break;
    case 9: // HRS - Halt and reset
      opcodee.value = 'HRS';
      opcoded.innerHTML = opcodee.value;
      operande.value = addr;
      mode = 0;
      pc = addr;
      opd.innerHTML = '';
      break;
  }
  pce.value = ndig(pc, 2);
  pcd.innerHTML = pce.value;
  memelem(ndig(pc, 2)).style.backgroundColor = '#77FFBB';
}

function dorstep() {
  if (mode == 0) clearInterval(intvar);
  else dostep();
}

function doslow() {
  mode = 1;
  intvar = setInterval(dorstep, 100);
}

function dorun() {
  mode = 1;
  while (mode) dostep();
}

function doloadrun() {
  mode = 1;
  while (mode && input.value) dostep();
}
