const fs = require('fs');
const expect = require('Chai').expect;
const { _test } = require(`${process.cwd()}/lib/update`);
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

const { getModifiedSourceFiles, updateSourceData, transformForUpdate, _getSuccessfulUpdates } = test;

describe('update', () => {
  let successfulUpdates, modifiedSourceFiles
  describe('getModifiedSourceFiles', () => {

    it('should get any source files that have been modified since last uplaod / update', (done) => {
      modifiedSourceFiles = getModifiedSourceFiles();
      expect(modifiedSourceFiles).to.be.a('array');
      expect(modifiedSourceFiles[0].filename).to.eql('somenewfile.json');
      done()
    })
  })

  describe('_getSuccessfulUpdates', () => {

    it('should get successful updates from array of ids', (done) => {
      successfulUpdates = _getSuccessfulUpdates([743637, 743638, 743635], [743700, undefined, 743701] );
      expect(successfulUpdates).to.be.a('array');
      successfulUpdates.forEach(({ newId }) => expect(newId).to.be.a('number') )
      done()
    })
  })

  describe('updateSourceData', () => {

    it('should get any source files that have been modified since last uplaod / update', (done) => {
      const mockConfigPath = `${fileMock}/mockConfig.qordoba.json`;
      if (fs.existsSync(mockConfigPath)) { fs.unlinkSync(`${fileMock}/mockConfig.qordoba.json`) }
      
      updateSourceData(successfulUpdates);

      expect(fs.existsSync(mockConfigPath)).to.eql(true);
      const source = JSON.parse(fs.readFileSync(mockConfigPath))['source']['en-us'];
      const fileIds = source.map(({fileId}) => fileId );
      expect(fileIds.includes(743700))
      fs.unlinkSync(`${fileMock}/mockConfig.qordoba.json`)
      done()
    })
  })

  describe('transformForUpdate', () => {

    it('should transform filenames to correct format', (done) => {
      expect(transformForUpdate(modifiedSourceFiles[0])).to.eql({ fileId: 743637, path: `${process.cwd()}/test/fileMock/somenewfile.json` })
      done()
    })
  })

})