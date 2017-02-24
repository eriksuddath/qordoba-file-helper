import fs from 'fs';
import app from './app';
import { getLastModified } from './helpers';

let configPath = `${process.cwd()}/qordoba.config.json`;
let configFile = require(configPath);

let { source, config } = configFile;
let { sourceLanguage, loadPath } = config;

// location of source language files
let sourceDir = `${process.cwd()}/${loadPath}/${sourceLanguage}`;

// get files from source directory and attach timestamps
const getFiles = () => {
  if (fs.existsSync(sourceDir)) {
    const filenames = fs.readdirSync(sourceDir);
    return filenames.map((file) => {
      return {
        filename: file,
        lastModified: getLastModified(file, sourceDir)
      }
    });
  } else {
    throw Error(`source directory path: ${sourceDir} is invalid`);
  }
};

// get saved file data for a specific file
const getFileData = (file) => {
  const sourceData = source[sourceLanguage];
  const fileData = sourceData.filter( ({ filename }) => filename === file.filename)[0];
  return fileData !== undefined ? fileData : {};
}

// get any files that have been modified since last update / upload
const getModifiedFiles = () => getFiles().filter( file => file.lastModified !== getFileData(file).lastModified );

const writeNewConfig = (files) => {
  const newConfig = Object.assign({}, configFile);

  // add timestamp and newId
  const newFiles = files.map( file => Object.assign({}, file, { lastModified: getLastModified(file.filename, sourceDir) }) );
  const oldFiles = newConfig.source[sourceLanguage];

  const newFilesNames = newFiles.map( ({ filename }) => filename );

  // add any old files back into new config
  oldFiles.forEach((oldFile) => {
    if (!newFilesNames.includes(oldFile.filename)) {
      newFiles.push(oldFile);
    }
  })

  newConfig.source[sourceLanguage] = newFiles;

  // write new config
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2))
}

// make sure source structure exists in config file
const _validateSourceData = () => {
  if (source === undefined) { source = {}};
  if (source[sourceLanguage] === undefined) { source[sourceLanguage] = [] };
  configFile.source = source;
}

// transform filenames into format for uploading
const transformForUpload = (filenames) => {
  return filenames.map( (filename) => {
    return {
      path: `${sourceDir}/${filename}`,
      type: 'JSON'
    }   
  })
}

// upload files to qordoba
const upload = (files, version) => {
  if (files.length === 0) {
    console.log('No new or modified files to upload');
    return;
  }

  console.log(`uploading ${files.map(({ path }) => path.split('/').slice(-1))} with versionTag ${version}`);
  app.file.upload(files, version)
  .then( (files) => {
    console.log(`successfully uploaded ${files.map(({ filename }) => filename )}`)
    writeNewConfig(files) 
  })
  .catch( err => console.log(err) )
}

// upload any new or modified files to Qordoba
const uploadModified = () => {
  _validateSourceData();
  const version = process.argv[2] || null;

  const filenames = getModifiedFiles().map( ({ filename }) => filename )
  const toUpload = transformForUpload(filenames);

  upload(toUpload, version);
}

// upload only new files to qordoba
// can use update command to update any existing files
const uploadNew = () => {
  _validateSourceData();
  const version = process.argv[2] || null;

  const savedSourceFiles = source[sourceLanguage];
  const storedFilenames = savedSourceFiles.map(({ filename }) => filename );

  const filenames = getFiles().map( ({ filename }) => filename );

  const toUpload = transformForUpload(filenames.filter( filename => !storedFilenames.includes(filename) ));

  upload(toUpload, version);
}

export { uploadModified, uploadNew };

// export private methods for testing and hijack some globals
export function _test(options) {
  source = options.source;
  sourceLanguage = options.sourceLanguage;
  sourceDir = options.sourceDir;
  configFile = options.configFile;
  configPath = options.configPath;
  return {
    getFiles,
    getFileData,
    getModifiedFiles,
    writeNewConfig,
    _validateSourceData,
    transformForUpload
  }
}


