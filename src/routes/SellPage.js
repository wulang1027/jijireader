import React from 'react';

import message from 'antd/lib/message';
import 'antd/lib/message/style';

import Button from 'antd/lib/button';
import 'antd/lib/button/style';

import { Row, Col } from 'antd/lib/grid';
import 'antd/lib/grid/style';

import InputNumber from 'antd/lib/input-number';
import 'antd/lib/input-number/style';

import { connect } from 'dva';

import styles from './DetailPage.css';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

const eth = require('../lib/ethereum');

class IndexPage extends React.Component {
  state = { amount: 0, money: 0 }

  render() {
    return (
      <div className={styles.normal}>
        <Header />
        <Row type="flex" justify="center" align="middle" style={{ minHeight: 400, padding: 30 }}>
          <Col>
            <Row type="flex" justify="center" align="middle">
              <h1>你想出售多少？</h1>
            </Row>
            <Row type="flex" justify="center" align="middle">
              <InputNumber
                min={0}
                step={1}
                style={{ width: 100 }}
                value={this.state.amount}
                onChange={(value) => {
                  const money = ((value * eth.toBigNumber(this.props.price))
                    / eth.toBigNumber('1000000000000000000')).toFixed(5);
                  this.setState({ amount: value, money });
                }}
              />
              <span style={{ margin: 20 }}> {'Ji 可以换取以太币 '} </span>
              <InputNumber
                style={{ width: 100 }}
                value={this.state.money}
                onChange={(value) => {
                  const amount = ((value * eth.toBigNumber('1000000000000000000')) / eth.toBigNumber(this.props.price)).toFixed(0);
                  this.setState({ money: value, amount });
                }}
              />
            </Row>
            <Row type="flex" justify="center" align="middle" style={{ marginTop: 20 }}>
              <Button
                onClick={() => {
                  eth.getAccounts((err, accounts) => {
                    eth.rwContract.sell(this.state.amount * eth.toBigNumber('1000000000000000000'),
                      {
                        from: accounts[0],
                      },
                    )
                      .then((tx) => {
                        this.props.dispatch({
                          type: 'main/addtx',
                          payload: {
                            tx,
                            callback: () => {
                              this.props.dispatch({ type: 'main/balanceFetch' });
                              this.props.dispatch({ type: 'main/allowSell' });
                            },
                          } });
                        message.success('购买请求已发布，但队列确认还需要时间');
                      })
                      .catch((err2) => {
                        message.error('用户取消或者发送失败！', err2);
                      });
                  });
                }}
              >出售</Button>
            </Row>
          </Col>
        </Row>
        <Footer />
      </div>
    );
  }
}

IndexPage.propTypes = {
};

export default connect((state) => {
  return { price: state.main.price };
})(IndexPage);
