const fs = require('fs');
const expect = require('Chai').expect;
const { getLastModified, _validateConfig } = require(`${process.cwd()}/lib/helpers`);
const fileMock = `${process.cwd()}/test/fileMock`;
const { goodConfig, badConfig } = require(`${fileMock}/testConfig`);

describe('helpers', () => {

  describe('getLanguageIds', () => {

    it('should get timestamp of file', (done) => {
      const lastModified = getLastModified('timestamp.js', fileMock)
      expect(lastModified).to.be.a('number');
      done()
    })
  })

})