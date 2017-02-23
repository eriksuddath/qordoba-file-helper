const fs = require('fs');
const expect = require('Chai').expect;
const { _test } = require(`${process.cwd()}/lib/upload`);
const langCodes = require(`${process.cwd()}/lib/lang_codes`);
const fileMock = `${process.cwd()}/test/fileMock`;
const { fullConfig } = require(`${fileMock}/testConfig`);

// hijack some global variables
const test = _test({
  source: { 'en-us': [ { "fileId": 743637, "filename": "somenewfile.json", "versionTag": "1.0", "lastModified": 1487801676000 } ] },
  sourceLanguage: 'en-us',
  sourceDir: fileMock,
  configFile: fullConfig,
  configPath: `${fileMock}/mockConfig.qordoba.json`
});

const { getFiles, getFileData, getModifiedFiles, writeNewConfig, _validateSourceData, transformForUpload } = test;

describe('upload', () => {

  describe('getFiles', () => {

    it('should get files from source directory and attach timestamps', (done) => {
      const files = getFiles();
      const filenames = files.map(({filename}) => filename);
      expect(filenames.includes('testConfig.js')).to.eql(true);
      const lastModified = files.map(({ lastModified }) => lastModified);
      lastModified.forEach( lm => expect(lm).to.be.a('number'));
      done()
    })
  })

  describe('getFileData', () => {

    it('should get files from source directory and attach timestamps', (done) => {
      const { fileId, lastModified } = getFileData({ filename: 'somenewfile.json' });
      expect(fileId).to.eql(743637);
      expect(lastModified).to.be.a('number');
      done()
    })
  })

  describe('getModifiedFiles', () => {

    it('should get any files that have been modified since last update / upload', (done) => {
      const modifiedFiles = getModifiedFiles();
      expect(modifiedFiles).to.be.a('array');
      done()
    })
  })

  describe('_validateSourceData', () => {

    it('should make sure source structure exists in config file', (done) => {
      _validateSourceData();
      expect(fullConfig['source']['en-us']).to.be.a('array');
      done()
    })
  })

  describe('transformForUpload', () => {

    it('should transform filenames into format for uploading', (done) => {
      expect(transformForUpload(['file1.json'])).to.eql([ { path: `${process.cwd()}/test/fileMock/file1.json`, type: 'JSON' } ])
      done()
    })
  })


})