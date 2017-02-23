import fs from 'fs';
import app from './app';

// grab qordoba.config.json from project's root directory
const configPath = `${process.cwd()}/qordoba.config.json`;
const configFile = require(configPath);
const { milestoneId, savePath } = configFile.config;

// grab lang codes to translate languageIds to codes
import langCodes from './lang_codes';

// get all target language ids for the project
const getLanguageIds = () => {
  return app.project.detail().then( ({ targetLanguages }) => targetLanguages.map( ({ targetId }) => targetId ))
}

// helper function to return language code
const getLanguageCode = (languageId) => {
  return langCodes[languageId]
}

// make sure target structure exists in config file
const _validateTargetData = (lgCode) => {
  if (configFile.target === undefined) { configFile.target = {}};
  if (configFile['target'][lgCode] === undefined) { configFile['target'][lgCode] = [] };
}

// get metadata from most recent version of project files
// for all languages
const getFileDataFromQordoba = () => {
  const files = [];
  let languageIds = [];

  return getLanguageIds().then((lgIds) => {
    languageIds = lgIds;

    lgIds.forEach( lgId => files.push(app.file.recent(lgId)));

    return Promise.all(files).then( (files) => {
      let fileData = {};

      languageIds.forEach( (lgId, index) => {
        const lgCode = getLanguageCode(lgId);
        fileData[lgCode] = files[index];
      });

      return fileData;
    });
  })
}

// build directories for target languages if they don't exist
const _validatePath = (savePath, lgCode) => {
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath);
  }

  const languageFolder = `${savePath}/${lgCode}`;
  if (!fs.existsSync(languageFolder)) {
    fs.mkdirSync(languageFolder);
  }
}

// download file from qordoba and write to appropriate path
const downloadAndWriteFile = (lgCode, fileId, filename) => {
  console.log(`downloading ${filename} for language code ${lgCode}`);

  return app.file.json(lgCode, milestoneId, fileId)
  .then((data) => {
    const json = data[0];
    const filepath = `${savePath}/${lgCode}/${filename}`;
    _validatePath(savePath, lgCode);
    fs.writeFileSync(filepath, JSON.stringify(json, null, 2));
  })
  .catch(err => console.log(err))
};

// write new config file to base directory
const writeNewConfig = (fileData) => {
  const newConfig = Object.assign({}, configFile);
  newConfig.target = fileData;
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
};

// check for and download any out of date files
const download = () => {

  getFileDataFromQordoba().then((fileData) => {
    const lgCodes = Object.keys(fileData);

    lgCodes.forEach((lgCode) => {
      _validateTargetData(lgCode);
      const files = fileData[lgCode];

      files.forEach(({ fileId, filename, updated }) => {
        const fileData = configFile.target[lgCode].filter( file => file.filename === filename )[0];
        const fsUpdated = fileData !== undefined ? fileData.updated : null;

        if (updated !== fsUpdated) {
          downloadAndWriteFile(lgCode, fileId, filename)
        } else {
          console.log(`${filename} for language code ${lgCode} is up to date`);
        }
      })
    })

    writeNewConfig(fileData);
  })
};

//export for use in constructor
export default download;

// export private methods for testing
export function _test() {
  return {
    getLanguageIds,
    getLanguageCode,
    getFileDataFromQordoba,
    _validatePath,
    downloadAndWriteFile,
    writeNewConfig,
    download
  }
}