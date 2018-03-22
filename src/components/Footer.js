import React from 'react';

import { connect } from 'dva';

import { Row } from 'antd/lib/grid';
import 'antd/lib/grid/style';

const constant = require('../lib/statics');
const eth = require('../lib/ethereum');

const Example = (props) => {
  const price = props.price ?
    (eth.toBigNumber(props.price) / eth.toBigNumber('1000000000000000000')).toString() : '0';
//  const allowSell = props.allowSell ?
//    (eth.toBigNumber(props.allowSell) / eth.toBigNumber('1000000000000000000')).toString() : '0';
  return (
    <Row style={{ padding: '20px 0', fontSize: 12, fontWeight: 300 }} type="flex" justify="center">
      <span style={{ padding: '0 20px', color: '#cccccccc' }}>基于以太坊区块链技术的文字社区，Token地址：{constant.addr} 当前价格：{price} ETH / JI</span>
    </Row>
  );
};

Example.propTypes = {
};

export default connect((state) => {
  return {
    price: state.main.price,
    allowSell: state.main.allowSell,
  };
})(Example);
