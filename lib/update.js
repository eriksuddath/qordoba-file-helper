'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports._test = _test;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _lang_codes = require('./lang_codes');

var _lang_codes2 = _interopRequireDefault(_lang_codes);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configPath = process.cwd() + '/qordoba.config.json';
var configFile = require(configPath);

var _configFile = configFile,
    source = _configFile.source,
    config = _configFile.config;
var loadPath = config.loadPath,
    sourceLanguage = config.sourceLanguage;

// location of source language files

var sourceDir = process.cwd() + '/' + loadPath + '/' + sourceLanguage;

// make sure source structure exists in config file
var _validateSourceData = function _validateSourceData() {
  if (configFile.source === undefined) {
    configFile.source = {};
  };
  if (configFile['source'][sourceLanguage] === undefined) {
    configFile['source'][sourceLanguage] = [];
  };
  source = configFile.source;
};

// get any source files that have been modified since last uplaod / update
var getModifiedSourceFiles = function getModifiedSourceFiles() {
  var uploadedFiles = source[sourceLanguage];
  return uploadedFiles.filter(function (_ref) {
    var lastModified = _ref.lastModified,
        filename = _ref.filename;
    return lastModified !== (0, _helpers.getLastModified)(filename, sourceDir);
  });
};

// update ids and timestamps in configFile
var updateSourceData = function updateSourceData(successfulUpdates) {
  var newConfigFile = (0, _assign2.default)({}, configFile);
  var newSourceFiles = [];
  var oldIds = successfulUpdates.map(function (_ref2) {
    var oldId = _ref2.oldId;
    return oldId;
  });

  source[sourceLanguage].forEach(function (file) {
    if (oldIds.includes(file.fileId)) {
      var fileId = successfulUpdates.filter(function (_ref3) {
        var oldId = _ref3.oldId;
        return oldId === file.fileId;
      })[0]['newId'];
      var lastModified = (0, _helpers.getLastModified)(file.filename, sourceDir);
      newSourceFiles.push((0, _assign2.default)({}, file, { fileId: fileId, lastModified: lastModified }));
    } else {
      newSourceFiles.push(file);
    }
  });

  newConfigFile['source'][sourceLanguage] = newSourceFiles;
  _fs2.default.writeFileSync(configPath, (0, _stringify2.default)(newConfigFile, null, 2));
};

// tranform files into correct format to pass to update sdk
var transformForUpdate = function transformForUpdate(_ref4) {
  var fileId = _ref4.fileId,
      filename = _ref4.filename;

  if (typeof fileId !== 'number') {
    throw Error('invalid file id in source config for ' + filename);
  };
  return { fileId: fileId, path: sourceDir + '/' + filename };
};

var _getSuccessfulUpdates = function _getSuccessfulUpdates(oldIds, newIds) {
  var successfulUpdates = [];

  newIds.forEach(function (newId, idx) {
    var oldId = oldIds[idx];
    if (newId === undefined) {
      console.log('updating file with fileId ' + oldId + ' failed');
    } else {
      successfulUpdates.push({ newId: newId, oldId: oldId });
    }
  });

  return successfulUpdates;
};

// update any source files that have been modified since last upload / update
var update = function update() {
  _validateSourceData();

  var files = getModifiedSourceFiles().map(transformForUpdate);

  if (files.length === 0) {
    console.log('no files have been modified since last uplaod / update');
    return;
  }

  var oldIds = files.map(function (_ref5) {
    var fileId = _ref5.fileId;
    return fileId;
  });
  var newIds = [];

  // promise queue to support bulk uploads
  var updateQueue = _promise2.default.resolve();

  files.forEach(function (file) {
    console.log('adding file with fileId: ' + file.fileId + ' to update queue');
    updateQueue = updateQueue.then(function () {
      return _app2.default.file.update(file);
    }).then(function (_ref6) {
      var files_ids = _ref6.files_ids;

      console.log('file with fileId: ' + file.fileId + ' updated. New id ' + files_ids[0]);
      newIds.push(files_ids[0]);
      return (0, _helpers.delay)();
    }).catch(function (err) {
      return console.log(err);
    });
  });
  return _promise2.default.resolve(updateQueue).then(function () {
    return updateSourceData(_getSuccessfulUpdates(oldIds, newIds));
  });
};

var logGlobal = function logGlobal() {
  return console.log(someVar);
};
//export for use in constructor
exports.default = update;

// export private methods for testing and hijack some globals

function _test(options) {
  source = options.source;
  sourceLanguage = options.sourceLanguage;
  sourceDir = options.sourceDir;
  configFile = options.configFile;
  configPath = options.configPath;
  return {
    getModifiedSourceFiles: getModifiedSourceFiles,
    updateSourceData: updateSourceData,
    transformForUpdate: transformForUpdate,
    _getSuccessfulUpdates: _getSuccessfulUpdates,
    logGlobal: logGlobal
  };
}