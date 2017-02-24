# qordoba-file-helper

npm cli package to upload, update, and download files to / from qordoba

## Getting Started

Before getting started, you will need to visit Qordoba.com, set up an account, and create a new project. Select JSON as your file type. Once your project is created, go to the settings tab and at the top click on cli config to get your organizationId, and projectId.

## Install via npm

npm install qordoba-file-helper

# File Structure.


```
├── root
│   ├── bin
│   │   ├── download.js 
│   │   ├── update.js
│   │   ├── uploadAll.js
│   │   ├── uploadModified.js
│   │   ├── uploadnew.js
│   ├── lib
│   ├── src
│   │   ├── App.js
│   │   ├── download.js
│   │   ├── helpers.js
│   │   ├── index.js
│   │   ├── lang_codes.js
│   │   ├── update.js
│   │   ├── upload.js
│   ├── test
│   ├── node_modules
│   ├── gulpfile.js // handles 'gulp build' command
│   ├── package.json
```

An example of how you might use the plugin

```
├── example
│   ├── locales
│   │   ├── en-us (source language folder)
│   │   │   ├── sourceLanguageFile.json (source language file)
│   │   ├── es-mx (target language folder)
│   │   │   ├── targetLanguageFile.json
│   ├── node_modules
│   ├── package.json
```

## Configuration

Create a 'qordoba.config.json' file in your root directory;

{
  "config": {
    "loadPath": "./locales",
    "savePath": "./locales",
    "organizationId": ORGANIZATION_ID,
    "projectId": PROJECT_ID,
    "milestoneId": MILESTONE_ID,
    "consumerKey": "CONSUMER_KEY",
    "sourceLanguage": "en-us",
  }
}

- loadPath = path to directory that contains source language folder (i.e. 'en-us')
- savePath = path to save target language folders into (i.e. 'es-mx')
- projectId = id of your qordoba project
- organizationId = id of your qordoba organization
- milestoneId = id of milestone (eg. 'Proofreading' ) that you want to pull translations from
- sourceLanguage = source language of your project
- consumer-key = qordoba api access key

Copy and paste the commands below into the scripts section of you packageJson

{
  "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "download": "node node_modules/.bin/qordoba-download",
      "update": "node node_modules/.bin/qordoba-update",
      "uploadNew": "node node_modules/.bin/qordoba-uploadNew",
      "uploadModified": "node node_modules/.bin/qordoba-uploadModified",
      "uploadAll": "node node_modules/.bin/qordoba-uploadAll"
    }
}

When you install npm install qordoba-file-helper, npm will add the qordoba-download, qordoba-update, etc .js file into the .bin folder of you root node_modules directory. Feel free to rename the keys to whatever you like.


### API

download
* downloads all modified or new files from qordoba
* checks most recent versions of each file at qordoba and compares them to file metadata inside target section of qordoba.config.json
* if the files don't exist or if the updated timestamp doens't match, it will download and overwrite files to savePath/{{languageCode}}/{{filename}}

uploadNew
* uploads any new files in the soruce language folder
* checks all files in specified loadPath against the source key in the config file and uploads any files missing from qordoba.config.json 
* writes new file into to config file after successful upload

npm run uploadNew 1.0

NOTE: Requires passing a version number as an arguments (see above command)

uploadModified
* uploads all new and modified files to qordoba
* checks filesystem timestamp against saved 
* timestamp in qordoba.config.json
* updates timestamp and fileId in config file after successful upload

npm run uploadModified 1.1

NOTE: Requires passing a version number as an arguments (see above command)

uploadAll
* updates all source files in qordoba.config.json that have been modified
* updates config with new fileId and timestamp after successful update

NOTE: Requires passing a version number as an arguments (see above command)

npm run uploadAll 2.0

update
* updates all source files in qordoba.config.json that have been modified
* updates config with new fileId and timestamp after successful update

npm run update

### Development Scripts

Root Directory
- 'gulp build' - transpliles ES6 code from src -> lib into ES5. Provides runtime support for promises.

### Prerequisites

- none

## Running the tests

'npm test' in the root directory

## Built With

* [qordoba-nodejs-sdk](http://qordoba.com/) - create and publish content to +100 markets


## Authors

* **Erik Suddath** -

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


