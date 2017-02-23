const fs = require('fs');
const expect = require('Chai').expect;
const { _test } = require(`${process.cwd()}/lib/download`);
const langCodes = require(`${process.cwd()}/lib/lang_codes`);
const fileMock = `${process.cwd()}/test/fileMock`

const { getLanguageIds, getLanguageCode, getFileDataFromQordoba, _validatePath, downloadAndWriteFile, writeNewConfig } = _test();

xdescribe('download', () => {

  describe('getLanguageIds', () => {

    it('should return a list of valid language ids', (done) => {
      getLanguageIds()
      .then( (langIds) => {
        expect(langIds).to.be.a('array');
        expect(langIds.length).to.not.eql(0);
        expect(langIds[0]).to.be.a('number');
        done()
      })
    })
  })

  describe('getLanguageCode', () => {

    it('should return language code given languageId', (done) => {
      expect(getLanguageCode(222)).to.eql("es-mx");
      done()
    })
  })

  describe('getFileDataFromQordoba', () => {

    it('should get metadata from most recent version of project files', (done) => {
      getFileDataFromQordoba().then( (fileData) => {
        expect(fileData).to.be.a('object');

        const langCodes = Object.keys(fileData);

        langCodes.forEach( (langCode) => {
          expect(fileData[langCode]).to.be.a('array');
        });

        done();
      })
    })
  })

  describe('_validatePath', () => {

    it('should build directories for target languages if they dont exist', (done) => {
      if (fs.existsSync(`${fileMock}/en-us`)) { fs.rmdirSync(`${fileMock}/en-us`) }

      _validatePath(fileMock, 'en-us');

      expect(fs.existsSync(`${fileMock}/en-us`)).to.eql(true);

      fs.rmdirSync(`${fileMock}/en-us`)

      done()
    })
  })

})