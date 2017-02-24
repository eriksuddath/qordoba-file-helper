import fs from 'fs';
import app from './app';
import langCodes from './lang_codes';
import { getLastModified, delay } from './helpers';

let configPath = `${process.cwd()}/qordoba.config.json`;
let configFile = require(configPath);

let { source, config } = configFile;
let { loadPath, sourceLanguage } = config;

// location of source language files
let sourceDir = `${process.cwd()}/${loadPath}/${sourceLanguage}`;

// make sure source structure exists in config file
const _validateSourceData = () => {
  if (configFile.source === undefined) { configFile.source = {}};
  if (configFile['source'][sourceLanguage] === undefined) { configFile['source'][sourceLanguage] = [] };
  source = configFile.source;
}

// get any source files that have been modified since last uplaod / update
const getModifiedSourceFiles = () => {
  const uploadedFiles = source[sourceLanguage];
  return uploadedFiles.filter( ({ lastModified, filename }) => lastModified !== getLastModified(filename, sourceDir))
}

// update ids and timestamps in configFile
const updateSourceData = (successfulUpdates) => {
  const newConfigFile = Object.assign({}, configFile);
  const newSourceFiles = [];
  const oldIds = successfulUpdates.map( ({ oldId }) => oldId );

  source[sourceLanguage].forEach( (file) => {
    if (oldIds.includes(file.fileId)) {
      const fileId = successfulUpdates.filter( ({ oldId }) => oldId === file.fileId )[0]['newId'];
      const lastModified = getLastModified(file.filename, sourceDir);
      newSourceFiles.push(Object.assign({}, file, { fileId, lastModified }))
    } else {
      newSourceFiles.push(file);
    }
  });

  newConfigFile['source'][sourceLanguage] = newSourceFiles;
  fs.writeFileSync(configPath, JSON.stringify(newConfigFile, null, 2))
}

// tranform files into correct format to pass to update sdk
const transformForUpdate = ({ fileId, filename }) => {
  if (typeof fileId !== 'number') { throw Error(`invalid file id in source config for ${filename}`)};
  return { fileId, path: `${sourceDir}/${filename}` }
}

const _getSuccessfulUpdates = (oldIds, newIds) => {
  const successfulUpdates = [];

  newIds.forEach( (newId, idx) => {
    const oldId = oldIds[idx];
    if (newId === undefined) {
      console.log(`updating file with fileId ${oldId} failed`);
    } else {
      successfulUpdates.push({ newId, oldId });
    }
  })

  return successfulUpdates;
}

// update any source files that have been modified since last upload / update
const update = () => {
  _validateSourceData();

  const files = getModifiedSourceFiles().map(transformForUpdate)

  if (files.length === 0) {
    console.log(`no files have been modified since last uplaod / update`);
    return;
  }

  const oldIds = files.map( ({ fileId }) => fileId );
  const newIds = [];

  // promise queue to support bulk uploads
  let updateQueue = Promise.resolve();

  files.forEach( (file) => {
    console.log(`adding file with fileId: ${file.fileId} to update queue`);
    updateQueue = updateQueue.then( () => app.file.update(file) )
      .then( ({ files_ids }) => {
        console.log(`successfully updated file with fileId: ${file.fileId}. New id ${files_ids[0]}`);
        newIds.push( files_ids[0] )
        return delay();
      })
      .catch( err => console.log(err) )
  })
  return Promise.resolve(updateQueue).then( () => updateSourceData(_getSuccessfulUpdates(oldIds, newIds)) );
}

const logGlobal = () => console.log(someVar)
//export for use in constructor
export default update;

// export private methods for testing and hijack some globals
export function _test(options) {
  source = options.source;
  sourceLanguage = options.sourceLanguage;
  sourceDir = options.sourceDir;
  configFile = options.configFile;
  configPath = options.configPath;
  return {
    getModifiedSourceFiles,
    updateSourceData,
    transformForUpdate,
    _getSuccessfulUpdates,
    logGlobal
  }
}