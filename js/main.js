'use strict';

var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();

var processData = function (data) {
  console.log("PROCESSING Data:", data.toString());
  var id = data[0];
  var blockId = data[1];
  var type = data[2];
  var position = data[3];
  var color = data[4];

  position = position.trim();
  position = position.slice(1, position.length-1);
  position = position.split(',');

  color = color.trim();
  color = color.slice(1, color.length-1);
  color = color.split(',');

  if (type == CMD_LOCATION) {
    AddCube(new Cube({
      id: blockId,
      x: position[0], y: position[1], z: position[2],
      r: color[0]/255.0, g: color[1]/255.0, b: color[2]/255.0
    }));
  }
};

var parseBuffer = function (buffer) {
  var startPos = buffer.indexOf(START_CHAR);
  var endPos = buffer.indexOf(END_CHAR);

  if (startPos == -1 || endPos == -1) {
    return buffer;
  }
  var data = buffer.slice(startPos + 2, endPos).trim();
  data = data.split(' ');
  processData(data);

  return buffer.slice(endPos+1);
};

btSerial.connect(BT_ADDRESS, 1, function () {
  console.log('connected');

  btSerial.write(new Buffer('my data', 'utf-8'), function (err, bytesWritten) {
    if (err) {
      console.log(err);
    }
  });

  var data = "";
  btSerial.on('data', function (buffer) {
    var stringBuffer = buffer.toString('utf-8');
    data = parseBuffer(data + stringBuffer);
  });
}, function () {
    console.log('cannot connect');
});

var strings = [
  'S', ' 143 32 L (0,0,0) (20,20,20) ', 'i', ' i', ' XXX', 'E',
  'S', ' 143 33 L (1,0,0) (100,0,0) ', 'i', ' i', ' XXX', 'E'
];

var i = 0;
var b = '';
setInterval(function () {
  if (i < strings.length) {
    b = parseBuffer(b + strings[i]);
  }

  i += 1;
}, 300);
