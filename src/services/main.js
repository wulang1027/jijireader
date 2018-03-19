const request = require('superagent');
const abiDecoder = require('../thirdparty/abi-decoder');

const eth = require('../lib/ethereum');
const infolib = require('../lib/info');

abiDecoder.addABI(eth.abi);

export function priceCNY() {
  return new Promise((resolve, reject) => {
    request('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=CNY')
      .end((err, res) => {
        if (err) {
          reject(err);
        } else if (res.body) {
          resolve({ priceCNY: res.body.CNY });
        }
      });
  });
}

export function allowSell() {
  return new Promise((resolve, reject) => {
    eth.allowSell((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve({ allowSell: res });
      }
    });
  });
}

export function balance() {
  return new Promise((resolve, reject) => {
    eth.balance((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve({ balance: res });
      }
    });
  });
}

export function price() {
  return new Promise((resolve, reject) => {
    eth.price((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve({ price: res });
      }
    });
  });
}

export function totalInfos() {
  return new Promise((resolve, reject) => {
    eth.total((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve({ total: res });
      }
    });
  });
}

export function reward() {
  return new Promise((resolve, reject) => {
    eth.reward((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve({ reward: res });
      }
    });
  });
}

export function scores(infos) {
  return new Promise((resolve, reject) => {
    if (infos.infos.length <= 0) return resolve(infos);
    eth.scores(infos, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(infos);
      }
    });
  });
}

export function geos() {
  return new Promise((resolve, reject) => {
    eth.listGeos((err, res) => {
      if (err) {
        reject(err);
      } else {
        const allgeo = abiDecoder.decodeLogs(res.body.result).map((item) => {
          return { id: item.events[0].value, geo: item.events[1].value };
        });
        resolve({ geos: allgeo });
      }
    });
  });
}

export function tags() {
  return new Promise((resolve, reject) => {
    eth.listTags((err, res) => {
      if (err) {
        reject(err);
      } else {
        const alltag = abiDecoder.decodeLogs(res.body.result).map((item) => {
          return { id: item.events[0].value, tag: item.events[1].value };
        });
        resolve({ tags: alltag });
      }
    });
  });
}

export function list(payload) {
  return new Promise((resolve, reject) => {
    eth.listInfo(payload.begin, 10, (err, res) => {
      if (err) {
        reject(err);
      } else {
        const infos = abiDecoder.decodeLogs(res.body.result).map((item, idx) => {
          return infolib.decode(res.body.result[idx].transactionHash, item);
        });
        resolve({ infos });
      }
    });
  });
}

export function buyedTotal() {
  return new Promise((resolve, reject) => {
    eth.buyedTotal((err, total) => {
      if (err) {
        reject(err);
      } else {
        resolve(total);
      }
    });
  });
}

export function authorTotal(_author) {
  return new Promise((resolve, reject) => {
    eth.authorTotal(_author, (err, total) => {
      if (err) {
        reject(err);
      } else {
        resolve(total);
      }
    });
  });
}

export function geosTotal(_geos) {
  return new Promise((resolve, reject) => {
    if (_geos.geos.length <= 0) return resolve(_geos);
    eth.geoTotal(_geos, (err, total) => {
      if (err) {
        reject(err);
      } else {
        _geos.geos.forEach((_geo, idx) => {
          _geo.total = total[idx]; // eslint-disable-line
        });
        resolve({ ..._geos });
      }
    });
  });
}

export function tagsTotal(_tags) {
  return new Promise((resolve, reject) => {
    if (_tags.tags.length <= 0) return resolve(_tags);
    eth.tagTotal(_tags, (err, total) => {
      if (err) {
        reject(err);
      } else {
        _tags.tags.forEach((_tag, idx) => {
          _tag.total = total[idx]; // eslint-disable-line
        });
        resolve(_tags);
      }
    });
  });
}

export function geo(payload) {
  return new Promise((resolve, reject) => {
    eth.listGeo(payload.id, payload.begin, 10, (err, res) => {
      if (err) {
        reject(err);
      } else {
        const infos = abiDecoder.decodeLogs(res.body.result).map((item, idx) => {
          return infolib.decode(res.body.result[idx].transactionHash, item);
        });
        resolve({ infos });
      }
    });
  });
}

export function buyed(payload) {
  return new Promise((resolve, reject) => {
    eth.listBuyed(payload.begin, 10, (err, res) => {
      if (err) {
        reject(err);
      } else {
        const infos = abiDecoder.decodeLogs(res.body.result).map((item, idx) => {
          return infolib.decode(res.body.result[idx].transactionHash, item);
        });
        resolve({ infos });
      }
    });
  });
}

export function author(payload) {
  return new Promise((resolve, reject) => {
    eth.listAuthor(payload.id, payload.begin, 10, (err, res) => {
      if (err) {
        reject(err);
      } else {
        const infos = abiDecoder.decodeLogs(res.body.result).map((item, idx) => {
          return infolib.decode(res.body.result[idx].transactionHash, item);
        });
        resolve({ infos });
      }
    });
  });
}

export function tag(payload) {
  return new Promise((resolve, reject) => {
    eth.listTag(payload.id, payload.begin, 10, (err, res) => {
      if (err) {
        reject(err);
      } else {
        const infos = abiDecoder.decodeLogs(res.body.result).map((item, idx) => {
          return infolib.decode(res.body.result[idx].transactionHash, item);
        });
        resolve({ infos });
      }
    });
  });
}

export function hot() {
  return new Promise((resolve, reject) => {
    eth.listHot((err, res) => {
      if (err) {
        reject(err);
      } else {
        const infos = abiDecoder.decodeLogs(res.body.result).map((item, idx) => {
          return infolib.decode(res.body.result[idx].transactionHash, item);
        });
        resolve({ infos });
      }
    });
  });
}
