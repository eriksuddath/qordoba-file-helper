'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports._test = _test;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _lang_codes = require('./lang_codes');

var _lang_codes2 = _interopRequireDefault(_lang_codes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// grab qordoba.config.json from project's root directory
var configPath = process.cwd() + '/qordoba.config.json';
var configFile = require(configPath);
var _configFile$config = configFile.config,
    milestoneId = _configFile$config.milestoneId,
    savePath = _configFile$config.savePath;

// grab lang codes to translate languageIds to codes

// get all target language ids for the project
var getLanguageIds = function getLanguageIds() {
  return _app2.default.project.detail().then(function (_ref) {
    var targetLanguages = _ref.targetLanguages;
    return targetLanguages.map(function (_ref2) {
      var targetId = _ref2.targetId;
      return targetId;
    });
  });
};

// helper function to return language code
var getLanguageCode = function getLanguageCode(languageId) {
  return _lang_codes2.default[languageId];
};

// get metadata from most recent version of project files
// for all languages
var getFileDataFromQordoba = function getFileDataFromQordoba() {
  var files = [];
  var languageIds = [];

  return getLanguageIds().then(function (lgIds) {
    languageIds = lgIds;

    lgIds.forEach(function (lgId) {
      return files.push(_app2.default.file.recent(lgId));
    });

    return _promise2.default.all(files).then(function (files) {
      var fileData = {};

      languageIds.forEach(function (lgId, index) {
        var lgCode = getLanguageCode(lgId);
        fileData[lgCode] = files[index];
      });

      return fileData;
    });
  });
};

// build directories for target languages if they don't exist
var _validatePath = function _validatePath(savePath, lgCode) {
  if (!_fs2.default.existsSync(savePath)) {
    _fs2.default.mkdirSync(savePath);
  }

  var languageFolder = savePath + '/' + lgCode;
  if (!_fs2.default.existsSync(languageFolder)) {
    _fs2.default.mkdirSync(languageFolder);
  }
};

// download file from qordoba and write to appropriate path
var downloadAndWriteFile = function downloadAndWriteFile(lgCode, fileId, filename) {
  console.log('downloading ' + filename + ' for language code ' + lgCode);

  return _app2.default.file.json(lgCode, milestoneId, fileId).then(function (data) {
    var json = data[0];
    var filepath = savePath + '/' + lgCode + '/' + filename;
    _validatePath(savePath, lgCode);
    _fs2.default.writeFileSync(filepath, (0, _stringify2.default)(json, null, 2));
  }).catch(function (err) {
    return console.log(err);
  });
};

// write new config file to base directory
var writeNewConfig = function writeNewConfig(fileData) {
  var newConfig = (0, _assign2.default)({}, configFile);
  newConfig.target = fileData;
  _fs2.default.writeFileSync(configPath, (0, _stringify2.default)(newConfig, null, 2));
};

// check for and download any out of date files
var download = function download() {
  getFileDataFromQordoba().then(function (fileData) {
    var lgCodes = (0, _keys2.default)(fileData);

    lgCodes.forEach(function (lgCode) {
      var files = fileData[lgCode];

      files.forEach(function (_ref3) {
        var fileId = _ref3.fileId,
            filename = _ref3.filename,
            updated = _ref3.updated;

        var fileData = configFile.target[lgCode].filter(function (file) {
          return file.filename === filename;
        })[0];
        var fsUpdated = fileData !== undefined ? fileData.updated : null;

        if (updated !== fsUpdated) {
          downloadAndWriteFile(lgCode, fileId, filename);
        } else {
          console.log(filename + ' for language code ' + lgCode + ' is up to date');
        }
      });
    });

    writeNewConfig(fileData);
  });
};

//export for use in constructor
exports.default = download;

// export private methods for testing

function _test() {
  return {
    getLanguageIds: getLanguageIds,
    getLanguageCode: getLanguageCode,
    getFileDataFromQordoba: getFileDataFromQordoba,
    _validatePath: _validatePath,
    downloadAndWriteFile: downloadAndWriteFile,
    writeNewConfig: writeNewConfig,
    download: download
  };
}