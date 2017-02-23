'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _qordobaJsSdk = require('qordoba-js-sdk');

var _qordobaJsSdk2 = _interopRequireDefault(_qordobaJsSdk);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require(process.cwd() + '/qordoba.config.json').config;
var consumerKey = config.consumerKey,
    organizationId = config.organizationId,
    projectId = config.projectId;


(0, _helpers._validateConfig)(config);

var app = new _qordobaJsSdk2.default({ consumerKey: consumerKey, organizationId: organizationId, projectId: projectId });

exports.default = app;