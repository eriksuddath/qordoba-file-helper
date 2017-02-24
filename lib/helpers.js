'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._validateConfig = exports._transformPath = exports.delay = exports.getLastModified = undefined;

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lang_codes = require('./lang_codes');

var _lang_codes2 = _interopRequireDefault(_lang_codes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// helper function to grab mtime file
var getLastModified = exports.getLastModified = function getLastModified(file, sourceDir) {
  var path = sourceDir + '/' + file;
  var stats = _fs2.default.statSync(path);
  return stats.mtime.valueOf();
};

// helper function to add delay to update process
var delay = exports.delay = function delay() {
  return new _promise2.default(function (resolve) {
    return setTimeout(resolve, 7000);
  });
};

// ERROR HANDLING
var SAVE_PATH_ERROR = 'savePath is not a valid directory';
var LOAD_PATH_ERROR = 'loadPath is not a valid directory';
var SOURCE_LANGUAGE_DIRECTORY_ERROR = 'source language directory is not a valid directory';
var SOURCE_LANGUAGE_ERROR = 'sourceLanguage must be a valid qordoba source language code';
var ORGANIZATION_ID_ERROR = 'organizationId must be a 4 digit number';
var PROJECT_ID_ERROR = 'projectId must be a 4 digit number';
var MILESTONE_ID_ERROR = 'must be a valid 4 digit numeric milestoneId';
var CONSUMER_KEY_ERROR = 'consumer key must be a 32 digit string';

// helper function to transform to path of cwd
var _transformPath = exports._transformPath = function _transformPath(path) {
  return process.cwd() + '/' + path;
};

// validates config before every call
var _validateConfig = exports._validateConfig = function _validateConfig(config) {
  V_loadPath(_transformPath(config.loadPath));
  V_savePath(_transformPath(config.savePath));
  V_organizationId(config.organizationId);
  V_projectId(config.projectId);
  V_milestoneId(config.milestoneId);
  V_consumerKey(config.consumerKey);
  V_sourceLanguage(config.sourceLanguage);
  V_sourceLanguageDirectory(_transformPath(config.loadPath + '/' + config.sourceLanguage));
};

// helper function to validate config
function V_savePath(savePath) {
  if (!_fs2.default.existsSync(savePath)) {
    throw Error(SAVE_PATH_ERROR);
  }
}

function V_loadPath(loadPath) {
  if (!_fs2.default.existsSync(loadPath)) {
    throw Error(LOAD_PATH_ERROR);
  }
}

function V_organizationId(organizationId) {
  if (typeof organizationId !== 'number' && String(organizationId).length !== 4) {
    throw Error(ORGANIZATION_ID_ERROR);
  }
}

function V_projectId(projectId) {
  if (typeof projectId !== 'number' && String(projectId).length !== 4) {
    throw Error(PROJECT_ID_ERROR);
  }
}

function V_milestoneId(milestoneId) {
  if (typeof milestoneId !== 'number' && String(milestoneId).length !== 4) {
    throw Error(MILESTONE_ID_ERROR);
  }
}

function V_consumerKey(consumerKey) {
  if (typeof consumerKey !== 'string' || String(consumerKey).length !== 32) {
    throw Error(CONSUMER_KEY_ERROR);
  }
}

function V_sourceLanguage(sourceLanguage) {
  if (typeof sourceLanguage !== 'string' || !(0, _values2.default)(_lang_codes2.default).includes(sourceLanguage)) {
    throw Error(SOURCE_LANGUAGE_ERROR);
  }
}

function V_sourceLanguageDirectory(sourceLanguageDirectory) {
  if (!_fs2.default.existsSync(sourceLanguageDirectory)) {
    throw Error(SOURCE_LANGUAGE_DIRECTORY_ERROR);
  }
}