var WORLD_SCALE = 100;

var BT_ADDRESS = '20-14-10-27-04-89';

var IN_DELIM = "!#@";
var OUT_DELIM = "\r\n";
var CMD_POSITION = 'P';
var CMD_COLOR = 'C';
var UID_LENGTH = 4;

var GenerateUID = function () {
  var res = '';
  for (var i = 0; i < UID_LENGTH; i++) {
    var num = Math.floor(Math.random() * 10);
    res += num;
  }
  return res;
};

var PadUID = function (id) {
  var res = '';
  var count = Math.pow(10, UID_LENGTH - 1);
  for (var i = 0; i < UID_LENGTH; i++) {
    res += Math.floor(id / count);
    id = id % count;
    count /= 10;
  }

  return res;
};

var BUFFER_SIZE = 60;
