import fs from 'fs';
import langCodes from './lang_codes';

// helper function to grab mtime file
export const getLastModified = (file, sourceDir) => {
  const path = `${sourceDir}/${file}`;
  const stats = fs.statSync(path)
  return stats.mtime.valueOf();
}

// helper function to add delay to update process
export const delay = () => new Promise(resolve => setTimeout(resolve, 7000));

// ERROR HANDLING
const SAVE_PATH_ERROR = 'savePath is not a valid directory';
const LOAD_PATH_ERROR = 'loadPath is not a valid directory';
const SOURCE_LANGUAGE_DIRECTORY_ERROR = 'source language directory is not a valid directory';
const SOURCE_LANGUAGE_ERROR = 'sourceLanguage must be a valid qordoba source language code'; 
const ORGANIZATION_ID_ERROR = 'organizationId must be a 4 digit number';
const PROJECT_ID_ERROR = 'projectId must be a 4 digit number';
const MILESTONE_ID_ERROR = 'must be a valid 4 digit numeric milestoneId';
const CONSUMER_KEY_ERROR = 'consumer key must be a 32 digit string';

// helper function to transform to path of cwd
export const _transformPath = (path) => `${process.cwd()}/${path}`;

// validates config before every call
export const _validateConfig = (config) => {
  V_loadPath(_transformPath(config.loadPath));
  V_savePath(_transformPath(config.savePath));
  V_organizationId(config.organizationId);
  V_projectId(config.projectId);
  V_milestoneId(config.milestoneId);
  V_consumerKey(config.consumerKey);
  V_sourceLanguage(config.sourceLanguage);
  V_sourceLanguageDirectory(_transformPath(`${config.loadPath}/${config.sourceLanguage}`));
}

// helper function to validate config
function V_savePath(savePath) {
  if (!fs.existsSync(savePath)) { throw Error(SAVE_PATH_ERROR) }
}

function V_loadPath(loadPath) {
  if (!fs.existsSync(loadPath)) { throw Error(LOAD_PATH_ERROR) }
}

function V_organizationId(organizationId) {
  if (typeof organizationId !== 'number' && String(organizationId).length !== 4 ) { throw Error(ORGANIZATION_ID_ERROR) }
}

function V_projectId(projectId) {
  if (typeof projectId !== 'number' && String(projectId).length !== 4) { throw Error(PROJECT_ID_ERROR) }
}

function V_milestoneId(milestoneId) {
  if (typeof milestoneId !== 'number' && String(milestoneId).length !== 4) { throw Error(MILESTONE_ID_ERROR) }
}

function V_consumerKey(consumerKey) {
  if (typeof consumerKey !== 'string' || String(consumerKey).length !== 32) { throw Error(CONSUMER_KEY_ERROR) }
}

function V_sourceLanguage(sourceLanguage) {
  if (typeof sourceLanguage !== 'string' || !Object.values(langCodes).includes(sourceLanguage) ) { throw Error(SOURCE_LANGUAGE_ERROR)}
}

function V_sourceLanguageDirectory(sourceLanguageDirectory) {
  if (!fs.existsSync(sourceLanguageDirectory)) { throw Error(SOURCE_LANGUAGE_DIRECTORY_ERROR)}
}


