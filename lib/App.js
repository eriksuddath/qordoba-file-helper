'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _qordobaNodejsSdk = require('qordoba-nodejs-sdk');

var _qordobaNodejsSdk2 = _interopRequireDefault(_qordobaNodejsSdk);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require(process.cwd() + '/qordoba.config.json').config;
var consumerKey = config.consumerKey,
    organizationId = config.organizationId,
    projectId = config.projectId;


(0, _helpers._validateConfig)(config);

var app = new _qordobaNodejsSdk2.default({ consumerKey: consumerKey, organizationId: organizationId, projectId: projectId });

exports.default = app;