'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadAll = exports.uploadNew = exports.uploadModified = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports._test = _test;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configPath = process.cwd() + '/qordoba.config.json';
var configFile = require(configPath);

var _configFile = configFile,
    source = _configFile.source,
    config = _configFile.config;
var sourceLanguage = config.sourceLanguage,
    loadPath = config.loadPath;

// location of source language files

var sourceDir = process.cwd() + '/' + loadPath + '/' + sourceLanguage;

// get files from source directory and attach timestamps
var getFiles = function getFiles() {
  if (_fs2.default.existsSync(sourceDir)) {
    var filenames = _fs2.default.readdirSync(sourceDir);
    return filenames.map(function (file) {
      return {
        filename: file,
        lastModified: (0, _helpers.getLastModified)(file, sourceDir)
      };
    });
  } else {
    throw Error('source directory path: ' + sourceDir + ' is invalid');
  }
};

// get saved file data for a specific file
var getFileData = function getFileData(file) {
  var sourceData = source[sourceLanguage];
  var fileData = sourceData.filter(function (_ref) {
    var filename = _ref.filename;
    return filename === file.filename;
  })[0];
  return fileData !== undefined ? fileData : {};
};

// get any files that have been modified since last update / upload
var getModifiedFiles = function getModifiedFiles() {
  return getFiles().filter(function (file) {
    return file.lastModified !== getFileData(file).lastModified;
  });
};

var writeNewConfig = function writeNewConfig(files) {
  var newConfig = (0, _assign2.default)({}, configFile);

  // add timestamp and newId
  var newFiles = files.map(function (file) {
    return (0, _assign2.default)({}, file, { lastModified: (0, _helpers.getLastModified)(file.filename, sourceDir) });
  });
  var oldFiles = newConfig.source[sourceLanguage];

  var newFilesNames = newFiles.map(function (_ref2) {
    var filename = _ref2.filename;
    return filename;
  });

  // add any old files back into new config
  oldFiles.forEach(function (oldFile) {
    if (!newFilesNames.includes(oldFile.filename)) {
      newFiles.push(oldFile);
    }
  });

  newConfig.source[sourceLanguage] = newFiles;

  // write new config
  _fs2.default.writeFileSync(configPath, (0, _stringify2.default)(newConfig, null, 2));
};

// make sure source structure exists in config file
var _validateSourceData = function _validateSourceData() {
  if (source === undefined) {
    source = {};
  };
  if (source[sourceLanguage] === undefined) {
    source[sourceLanguage] = [];
  };
  configFile.source = source;
};

// transform filenames into format for uploading
var transformForUpload = function transformForUpload(filenames) {
  return filenames.map(function (filename) {
    return {
      path: sourceDir + '/' + filename,
      type: 'JSON'
    };
  });
};

// upload files to qordoba
var upload = function upload(files, version) {
  if (files.length === 0) {
    console.log('No new or modified files to upload');
    return;
  }

  console.log('uploading:\n' + files.map(function (_ref3) {
    var path = _ref3.path;
    return path.split('/').slice(-1);
  }).join('\n') + '\nWith versionTag ' + version);
  _app2.default.file.upload(files, version).then(function (files) {
    console.log('successfully uploaded:\n' + files.map(function (_ref4) {
      var filename = _ref4.filename;
      return filename;
    }).join('\n'));
    writeNewConfig(files);
  }).catch(function (err) {
    return console.log(err);
  });
};

// upload any new or modified files to Qordoba
var uploadModified = function uploadModified() {
  _validateSourceData();
  var version = process.argv[2] || null;

  var filenames = getModifiedFiles().map(function (_ref5) {
    var filename = _ref5.filename;
    return filename;
  });
  var toUpload = transformForUpload(filenames);

  upload(toUpload, version);
};

// upload only new files to qordoba
// can use update command to update any existing files
var uploadNew = function uploadNew() {
  _validateSourceData();
  var version = process.argv[2] || null;

  var savedSourceFiles = source[sourceLanguage];
  var storedFilenames = savedSourceFiles.map(function (_ref6) {
    var filename = _ref6.filename;
    return filename;
  });

  var filenames = getFiles().map(function (_ref7) {
    var filename = _ref7.filename;
    return filename;
  });

  var toUpload = transformForUpload(filenames.filter(function (filename) {
    return !storedFilenames.includes(filename);
  }));

  upload(toUpload, version);
};

// upload all source files to qordoba
var uploadAll = function uploadAll() {
  _validateSourceData();
  var version = process.argv[2] || null;

  var savedSourceFiles = source[sourceLanguage];
  var storedFilenames = savedSourceFiles.map(function (_ref8) {
    var filename = _ref8.filename;
    return filename;
  });

  var filenames = getFiles().map(function (_ref9) {
    var filename = _ref9.filename;
    return filename;
  });

  var toUpload = transformForUpload(filenames);

  upload(toUpload, version);
};

exports.uploadModified = uploadModified;
exports.uploadNew = uploadNew;
exports.uploadAll = uploadAll;

// export private methods for testing and hijack some globals

function _test(options) {
  source = options.source;
  sourceLanguage = options.sourceLanguage;
  sourceDir = options.sourceDir;
  configFile = options.configFile;
  configPath = options.configPath;
  return {
    getFiles: getFiles,
    getFileData: getFileData,
    getModifiedFiles: getModifiedFiles,
    writeNewConfig: writeNewConfig,
    _validateSourceData: _validateSourceData,
    transformForUpload: transformForUpload
  };
}