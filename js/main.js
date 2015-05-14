'use strict';

var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var _ = require('lodash');

var processData = function (data) {
  console.log("PROCESS DATA: " + data.toString());

  var mutableData = data;
  var readChars = function (numChars) {
    var res = mutableData.substr(0, numChars);
    mutableData = mutableData.substring(numChars);
    return res;
  };

  var parseV3 = function (str) {
    str = str.trim();
    str = str.slice(1, str.length - 1);
    str = str.split(',');

    return _.map(str, function (val) {
      return parseInt(val) || 0;
    });
  };

  var type = readChars(1);
  var blockId = parseInt(readChars(4));
  readChars(1);

  mutableData = mutableData.split(' ');
  if (mutableData.length < 2) {
    return;
  }

  var position = parseV3(mutableData[0]);
  var color = parseV3(mutableData[1]);

  var fixColor = function (c) {
    var fin = ((c + 256) % 256) / 256.0;
    return fin;
  };

  color = _.map(color, fixColor);

  if (type == CMD_POSITION) {
    AddCube(new Cube({
      id: blockId,
      x: position[0], y: position[1], z: position[2],
      r: color[0] % 256, g: color[1] % 256, b: color[2]
    }));
  }
};

var parseBuffer = function (buffer) {
  var data = buffer.split(IN_DELIM);
  if (data.length > 2) {
    processData(data[1].trim());
    return _.slice(data, 2).join(IN_DELIM);
  }

  return buffer;
};

// %c %d %d %c (%d,%d,%d) (%d,%d,%d) %c %c
var constructCommand = function (blockId, color) {
  var id = GenerateUID();
  var cmd = [OUT_DELIM, CMD_COLOR, id, PadUID(blockId), color, OUT_DELIM].join('');
  console.log(cmd.toString());
  return cmd;
};

var BroadcastCubeWithIdAndColor = function (blockId, color) {
  var cmd = constructCommand(blockId, color);
  console.log(cmd);
  btSerial.write(new Buffer(cmd, 'utf-8'), function (err, bytesWritten) {
    if (err) {
      console.log(err);
    }
  });
};

btSerial.close();
btSerial.connect(BT_ADDRESS, 1, function () {
  console.log('connected');

  var data = '';
  btSerial.on('data', function (buffer) {
    var stringBuffer = buffer.toString('utf-8');
    data = parseBuffer(data + stringBuffer);
  });
}, function () {
    console.log('cannot connect');
});

// var strings = [
//   '\r\nP', '312', '1', '0010', '(1,0', ',0)',  ' (1,0', ',0)', '\r\n', 'balsdbhadlsfgadsf',
//   '\r\nP', '312', '1', '0011', '(0,0', ',0)',  ' (1,0', ',0)', '\r\n', 'balsdbhadlsfgadsf'
// ];

// var i = 0;
// var b = '';
// setInterval(function () {
//   if (i < strings.length) {
//     b = parseBuffer(b + strings[i]);
//   }

//   i += 1;
// }, 300);
