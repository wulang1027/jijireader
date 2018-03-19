
require('assert');
/* global describe it */
const api = require('etherscan-api').init('6xlgwFuipluDSQ6TvOTn', 'ropsten');
const eth = require('../src/lib/ethereum');
const abiDecoder = require('abi-decoder');

abiDecoder.addABI(eth.abi);

describe('logic', () => {
  describe('contract read', () => {
    it('balance', function list(done) {
      this.timeout(5000);
      const balance = api.account.balance('0x5a365e904f1c3199d3cd822977abda61f0efc041');
      balance.then((balanceData) => {
        console.log(balanceData);
        done();
      });
    });
    it('etherscan-api', function list(done) {
      this.timeout(5000);
      api.log.getLogs(eth.addr, 1, 'latest', '0x51c549fb10fdeb116e7904c2a185d5f1e6d5b13ef34871a3828f274e7ea53795')
      .then((res) => {
        if (res.result) {
          console.log(JSON.stringify(abiDecoder.decodeLogs(res.result), null, 4));
        }
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
    it('mine', function list(done) {
      this.timeout(5000);
      eth.listInfo(0, 0, (err, res) => {
        console.log(JSON.stringify(abiDecoder.decodeLogs(res.body.result), null, 4));
        done();
      });
    });
    it.only('ipfs', function list(done) {
      this.timeout(30000);
      const request=require('superagent');
      request.post('https://ipfs.infura.io:5001/api/v0/add')
        .attach('text', Buffer.from('is public', 'utf8'), 'public')
        .attach('text', Buffer.from('is private', 'utf8'), 'private')
        .responseType('arraybuffer')
        .end((err, res) => {
          console.log(res.body.toString('utf-8').trim().split('\n').map((line) => {
            return JSON.parse(line);
          }));
        });
    });
  });
});
