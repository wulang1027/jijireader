const Eth = require('ethjs-query');
const EthContract = require('ethjs-contract');

const request = require('superagent');
const abiDecoder = require('../thirdparty/abi-decoder');
const infolib = require('../lib/info');
const constant = require('./statics');
const BN = require('bignumber.js');

const infuraRequest = (method, param, callback) => {
  const url = `https://api.infura.io/v1/jsonrpc/ropsten/${method}?token=6xlgwFuipluDSQ6TvOTn&params=${param}`;
  // console.log(url);
  request.get(url)
  .end(callback);
};

const padding = (size, src) => {
  let s = String(src);
  while (s.length < (size || 2)) { s = `0${s}`; }
  return s;
};

/* global web3 */
class MyContract {
  constructor(abi, addr) {
    this.abi = abi;
    this.addr = addr;
    this.abiDecoder = abiDecoder;
    this.abiDecoder.addABI(abi);
    this.BN = BN;

    if (typeof web3 !== 'undefined') {
      this.web3 = web3;
      this.ethrw = new Eth(web3.currentProvider);
      const contract = new EthContract(this.ethrw);
      this.rwContract = contract(abi).at(addr);
      this.getAccounts = web3.eth.getAccounts;
    }
  }

  toBigNumber(item) {
    return new this.BN(item);
  }

  checkTx(tx, callback) {  // eslint-disable-line
    infuraRequest('eth_getTransactionByHash', `["${tx}"]`, (err, res) => {
      callback(err, res.body.result);
    });
  }

  allowSell(callback) {
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x36e0f6cc"},"latest"]`, (err, res) => {
      callback(null, res.body.result);
    });
  }

  balance(callback) {
    this.getAccounts((accerr, accounts) => {
      infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x70a08231000000000000000000000000${accounts[0].substr(2)}"},"latest"]`, (err, res) => {
        callback(null, res.body.result);
      });
    });
  }

  price(callback) {
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0xa035b1fe"},"latest"]`, (err, res) => {
      callback(null, res.body.result);
    });
  }

  total(callback) {
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x95604db9"},"latest"]`, (err, res) => {
      callback(null, this.toBigNumber(res.body.result).toNumber());
    });
  }

  reward(callback) {
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x1b34332a"},"latest"]`, (err, res) => {
      callback(null, res.body.result);
    });
  }

  encryptKey(callback) {
    const msgParams = [
      {
        type: 'string',      // Any valid solidity type
        name: 'decrypt',     // Any string label you want
        value: 'decenter', // The value to sign
      },
    ];
    this.getAccounts((err, accounts) => {
      if (accounts) return this.signMsg(msgParams, accounts[0], callback);
    });
  }

  signMsg(msgParams, from, callback) {
    this.web3.currentProvider.sendAsync({
      method: 'eth_signTypedData',
      params: [msgParams, from],
      from,
    }, (err, result) => {
      if (err) return callback(err);
      if (result.error) {
        return callback(result.error.message);
      }
      this.signCode = result.result;
      callback(null, result.result);
    });
  }

  decrypt(code, detail, callback) { // eslint-disable-line
    request.post(`${constant.encrypt}/decrypt`)
    .send({
      key: code,
      msg: [
          { id: detail.id },
      ],
    })
    .end((decryptErr, decryptRes) => {
      if (decryptErr) {
        callback(decryptErr);
      } else if (decryptRes.body.err) {
        callback(null, detail);
      } else {
        request.get(`https://ipfs.infura.io/ipfs/${decryptRes.body.cnt}`)
        .end((privateerr, privateres) => {
          detail.private = privateres.text; // eslint-disable-line
          callback(null, detail);
        });
      }
    });
  }

  event(hash, code, detail, callback) {
    // 如果已经知道code，并且已经取得了一部分内容，只需要取加密部分就好
    if (code && detail) {
      this.decrypt(code, detail, callback);
      return;
    }
    infuraRequest('eth_getTransactionReceipt', `["0x${hash}"]`, (err, res) => {
      const decodedLogs = this.abiDecoder.decodeLogs(res.body.result.logs)
      .filter((item) => { return item.name === 'NewInfo'; });
      const item = decodedLogs[0]; // We add NewTag and New Hash, So We should be careful
      detail = infolib.decode(hash, item); // eslint-disable-line
      // 检查当前用户是否已经购买过这个文章，即使购买过，仍然需要给解密服务器授权才可以获取其内容
      request.get(`https://ipfs.infura.io/ipfs/${detail.hash}`)
      .end((puberr, pubres) => {
        detail.public = pubres.text; // eslint-disable-line
        // 获取内容的动态部分，包括点赞数、踩数、价格和当前地址
        this.scores({ infos: [detail] }, () => {
          if (!this.getAccounts) {
            callback(null, detail);
            return;
          }
          this.getAccounts((errAccount, accounts) => {
            infuraRequest('eth_call',
              `[{"to":"${this.addr}", "data":"0xa1a63f65${padding(64, accounts[0].substr(2))}${padding(64, detail.id)}"},"latest"]`, (errCall, resCall) => {
                detail.buyed = resCall.body.result && resCall.body.result.endsWith('1'); // eslint-disable-line
                if (code) { // 如果知道当前的读者是谁，就尝试获得加密内容
                  this.decrypt(code, detail, callback);
                } else {
                  callback(null, detail);
                }
              });
          });
        });
      });
    });
  }

  buyedTotal(callback) {
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x5bac8714"},"latest"]`, (err, res) => {
      callback(err, this.toBigNumber(res.body.result.substr(2)));
    });
  }

  authorTotal(author, callback) {
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x38a0f6d4${padding(64, author)}"},"latest"]`, (err, res) => {
      callback(err, this.toBigNumber(res.body.result.substr(2)));
    });
  }

  geoTotal(geos, callback) {
    let arr = padding(64, this.toBigNumber(geos.geos.length).toString(16));
    geos.geos.forEach((geo) => {
      arr = `${arr}${padding(64, this.toBigNumber(geo.id).toString(16))}`;
    });
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0xf984b8350000000000000000000000000000000000000000000000000000000000000020${arr}"},"latest"]`, (err, res) => {
      callback(err, res.body.result.substr(130).match(/.{1,64}/g).map((item) => {
        return this.toBigNumber(item);
      }));
    });
  }

  tagTotal(tags, callback) {
    let arr = padding(64, this.toBigNumber(tags.tags.length).toString(16));
    tags.tags.forEach((tag) => {
      arr = `${arr}${padding(64, this.toBigNumber(tag.id).toString(16))}`;
    });
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x1dd894900000000000000000000000000000000000000000000000000000000000000020${arr}"},"latest"]`, (err, res) => {
      callback(err, res.body.result.substr(130).match(/.{1,64}/g).map((item) => {
        return this.toBigNumber(item);
      }));
    });
  }

  scores(infos, callback) {
    let arr = padding(64, this.toBigNumber(infos.infos.length).toString(16));
    infos.infos.forEach((info) => {
      arr = `${arr}${padding(64, this.toBigNumber(info.id).toString(16))}`;
    });
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x9b51fbcd0000000000000000000000000000000000000000000000000000000000000020${arr}"},"latest"]`, (err, res) => {
      const retvalues = res.body.result.substr(258).match(/.{1,64}/g).map((item) => {
        return this.toBigNumber(`0x${item}`);
      });
      const retnumbers = retvalues[0].toNumber();
      infos.infos.forEach((info, idx) => {
        info.like = retvalues[1 + idx]; // eslint-disable-line
        info.dislike = retvalues[(1 + retnumbers) * 1 + 1 + idx]; // eslint-disable-line
        info.price = retvalues[(1 + retnumbers) * 2 + 1 + idx]; // eslint-disable-line
        info.owner = retvalues[(1 + retnumbers) * 3 + 1 + idx].toString(16); // eslint-disable-line
      });
      callback(null, infos);
    });
  }

  listHot(callback) {
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x84837ee1"},"latest"]`, (err, res) => {
      const infoIDs = res.body.result.trim().substr(2).match(/.{1,64}/g)
      .filter((item) => {
        return this.toBigNumber(item) > 0;
      })
      .map((item) => {
        return `"0x${item}"`;
      })
      .join(',');
      infuraRequest('eth_getLogs', `[{"address":"${this.addr}", "fromBlock":"0x1","toBlock":"latest","topics":["${constant.newInfoTopic}", [${infoIDs}]]}]`,
      callback);
    });
  }

  /**
   * 获取某个标签下某一页的内容，通过调用智能合约中的 getTagInfos 函数
   * @param {*} tagID 标签编号就是一个整数，不是标签内容
   * @param {*} start 从哪个位置开始，不小于 0
   * @param {*} limit 显示多少个
   * @param {*} callback 回调函数
   */
  listTag(tagID, start, limit, callback) {
    let reverseStart = start - limit;
    if (reverseStart < 0) reverseStart = 0;
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0xf648c5c0${padding(64, this.toBigNumber(tagID).toString(16))}${padding(64, this.toBigNumber(reverseStart).toString(16))}${padding(64, this.toBigNumber(limit).toString(16))}"}, "latest"]`, (err, res) => {
      const infoids = res.body.result.substr(130).match(/.{1,64}/g).map((item) => {
        return `0x${item}`;
      });
      infuraRequest('eth_getLogs', `[{"address":"${this.addr}", "fromBlock":"0x1","toBlock":"latest","topics":["${constant.newInfoTopic}",${JSON.stringify(infoids)}]}]`, callback);
    });
  }

  listBuyed(start, limit, callback) {
    let reverseStart = start - limit;
    if (reverseStart < 0) reverseStart = 0;
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x55ed01aa${padding(64, this.toBigNumber(reverseStart).toString(16))}${padding(64, this.toBigNumber(limit).toString(16))}"}, "latest"]`, (err, res) => {
      const infoids = res.body.result.substr(130).match(/.{1,64}/g).map((item) => {
        return `0x${item}`;
      });
      infuraRequest('eth_getLogs', `[{"address":"${this.addr}", "fromBlock":"0x1","toBlock":"latest","topics":["${constant.newInfoTopic}",${JSON.stringify(infoids)}]}]`, callback);
    });
  }

  listAuthor(author, start, limit, callback) {
    let reverseStart = start - limit;
    if (reverseStart < 0) reverseStart = 0;
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0xe7a5862f${padding(64, author)}${padding(64, this.toBigNumber(reverseStart).toString(16))}${padding(64, this.toBigNumber(limit).toString(16))}"}, "latest"]`, (err, res) => {
      const infoids = res.body.result.substr(130).match(/.{1,64}/g).map((item) => {
        return `0x${item}`;
      });
      infuraRequest('eth_getLogs', `[{"address":"${this.addr}", "fromBlock":"0x1","toBlock":"latest","topics":["${constant.newInfoTopic}",${JSON.stringify(infoids)}]}]`, callback);
    });
  }

  listGeo(tagID, start, limit, callback) {
    let reverseStart = start - limit;
    if (reverseStart < 0) reverseStart = 0;
    infuraRequest('eth_call', `[{"to":"${this.addr}", "data":"0x334271b6${padding(64, this.toBigNumber(tagID).toString(16))}${padding(64, this.toBigNumber(reverseStart).toString(16))}${padding(64, this.toBigNumber(limit).toString(16))}"}, "latest"]`, (err, res) => {
      const infoids = res.body.result.substr(130).match(/.{1,64}/g).map((item) => {
        return `0x${item}`;
      });
      infuraRequest('eth_getLogs', `[{"address":"${this.addr}", "fromBlock":"0x1","toBlock":"latest","topics":["${constant.newInfoTopic}",${JSON.stringify(infoids)}]}]`, callback);
    });
  }

  listGeos(callback) {
    infuraRequest('eth_getLogs', `[{"address":"${this.addr}", "fromBlock":"0x1","toBlock":"latest","topics":["0x69700cb339bc28cabd73a4ca0ad412f69622e5aecc734fb08aa5747cd172ec25"]}]`, callback);
  }

  listInfo(start, limit, callback) {
    const all = Array(...{ length: limit }).map((item, idx) => {
      return this.toBigNumber(start - idx);
    }).filter((item) => {
      return item > 0;
    }).map((item) => {
      return `0x${padding(64, item.toString(16))}`;
    });
    infuraRequest('eth_getLogs', `[{"address":"${this.addr}", "fromBlock":"0x1","toBlock":"latest","topics":["${constant.newInfoTopic}",${JSON.stringify(all)}]}]`, callback);
  }

  /**
   * 获取所有的标签，通过搜索 Event 的方式
   * @param {*} callback
   */
  listTags(callback) {
    infuraRequest('eth_getLogs', `[{"address":"${this.addr}", "fromBlock":"0x1","toBlock":"latest","topics":["0x1352cba75805d4534a8d51524faef03434e514c640ee370117c603f6f987f78f"]}]`, callback);
  }
}

const contract = new MyContract(constant.abi, constant.addr);

module.exports = contract;
