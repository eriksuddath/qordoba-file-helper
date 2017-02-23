import App from 'qordoba-js-sdk';
import { _validateConfig } from './helpers';
const config = require(`${process.cwd()}/qordoba.config.json`).config;
const { consumerKey, organizationId, projectId } = config;

_validateConfig(config);

const app = new App({ consumerKey, organizationId, projectId });

export default app;