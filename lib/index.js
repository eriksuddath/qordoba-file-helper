'use strict';

var _download = require('./download');

var _download2 = _interopRequireDefault(_download);

var _upload = require('./upload');

var _update = require('./update');

var _update2 = _interopRequireDefault(_update);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _exports = module.exports = {};

/**
* uploads new and modified files to qordoba
* checks filesystem timestamp against saved 
* timestamp in qordoba.config.json
* updates timestamp and fileId in config file after successful upload
*/
_exports.uploadModified = _upload.uploadModified;
/**
* uploads any new files that don't exist yet in qordoba.config.json
* checks all files in specified loadPath against the source key in
* the config file and uploads any files missing from qordoba.config.json 
* writes new file into to config file after successful upload
*/
_exports.uploadNew = _upload.uploadNew;
/**
* updates any source files in qordoba.config.json that have been modified
* since last upload / update
* updates config with new fileId and timestamp after successful update
*/
_exports.update = _update2.default;
/**
* downloads all modified or new files from qordoba
* checks most recent versions of each file at qordoba and compares them
* to files inside target section of qordoba.config.json
* if the files don't exist or if the updated timestamp doens't match
* it will download and overwrite files to savePath/{{languageCode}}/{{filename}}
*/
_exports.download = _download2.default;