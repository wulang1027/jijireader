import React from 'react';

import Spin from 'antd/lib/spin';
import 'antd/lib/spin/style';
import message from 'antd/lib/message';
import 'antd/lib/message/style';
import { Link } from 'dva/router';

import { connect } from 'dva';

import Button from 'antd/lib/button';
import 'antd/lib/button/style';

import { Row } from 'antd/lib/grid';
import 'antd/lib/grid/style';

import styles from './DetailPage.css';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

const infolib = require('../lib/info');
const eth = require('../lib/ethereum');

const ReactMarkdown = require('react-markdown');

/* global web3 */
class IndexPage extends React.Component {
  state = {
    loading: true,
    item: {
      title: '正在加载中...',
      public: '',
      private: '',
      position: '',
      price: '',
    },
  }

  componentDidMount() {
    this.loadEvent(this.props.match.params.id, this.props.signCode);
  }

  loadEvent(id) {
    eth.event(id, this.props.signCode, (err, item) => {
      if (err) {
        message.error(err);
      } else {
        this.setState({
          loading: false,
          item,
        });
      }
    });
  }

  like() {
    eth.getAccounts((err, accounts) => {
      eth.rwContract.like(this.state.item.id,
        { from: accounts[0] },
      )
        .then((tx) => {
          this.props.dispatch({ type: 'main/addtx',
            payload: {
              tx,
              callback: () => {
                this.props.dispatch({ type: 'main/balanceFetch' });
              },
            } });
          message.success('评价已发布，矿工兄弟们正在努力确认');
        })
        .catch((err2) => {
          message.error('用户取消或者发送失败！', err2);
        });
    });
  }

  dislike() {
    eth.getAccounts((err, accounts) => {
      eth.rwContract.dislike(this.state.item.id,
        { from: accounts[0] },
      )
        .then((tx) => {
          this.props.dispatch({ type: 'main/addtx', payload: { tx } });
          message.success('评价已发布，矿工兄弟们正在努力确认');
        })
        .catch((err2) => {
          message.error('用户取消或者发送失败！', err2);
        });
    });
  }

  render() {
    const price = this.props.price ?
    (web3.toBigNumber(this.props.price) /
      web3.toBigNumber('1000000000000000000')).toFixed(5) : 0;
    const cny = ((this.props.priceCNY * price) * this.state.item.price) /
    web3.toBigNumber('1000000000000000000');
    return (
      <div className={styles.normal}>
        <Header />
        <Spin size="large" spinning={this.state.loading}>
          <div className={styles.content}>
            <ReactMarkdown
              source={infolib.mixPreview(this.state.item)}
            />
            {this.state.item.private ?
              <Row type="flex" style={{ marginTop: 50 }} align="middle">
                <Button
                  type="primary"
                  shape="circle"
                  icon="like"
                  style={{ marginRight: 10 }}
                  onClick={this.like.bind(this)}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon="dislike"
                  style={{ marginRight: 10 }}
                  onClick={this.dislike.bind(this)}
                />
                <span>评价文章您将获得 {this.props.reward ?
                  this.props.reward / web3.toBigNumber('1000000000000000000').toFixed(4) : 0
              } 唧唧币的奖励 </span>
              </Row>
            :
              <Row>
                {(this.props.balance - this.state.item.price) >= web3.toBigNumber('0') ?
                  <Button
                    onClick={() => {
                      eth.getAccounts((err, accounts) => {
                        eth.rwContract.buyInfo(this.state.item.id, { from: accounts[0] })
                        .then((tx) => {
                          this.props.dispatch({
                            type: 'main/addtx',
                            payload: {
                              tx,
                              callback: () => {
                                this.loadEvent(this.props.match.params.id, this.props.signCode);
                              },
                            } });
                          message.success('文章已购买，但队列确认还需要时间');
                        })
                        .catch((err2) => {
                          message.error('用户取消或者发送失败！', err2);
                        });
                      });
                    }
                  }
                  >花费 {(this.state.item.price / web3.toBigNumber('1000000000000000000')).toFixed(0)} 个唧唧币 ({cny} 元) 购买付费部分
                  </Button> :
                  <Button disabled>您的余额不足，无法购买</Button>}
                {this.props.signCode ? null :
                <Button
                  style={{ marginLeft: 15 }}
                  onClick={() => {
                    eth.encryptKey((err, code) => {
                      if (code) {
                        this.props.dispatch({ type: 'main/save', payload: { signCode: code } });
                        this.loadEvent(this.props.match.params.id, code);
                      }
                    });
                  }}
                >
                  如果您已经购买过此文章，请点此按钮更新授权
                </Button>
                }
              </Row>
            }
            <Row style={{ marginTop: 20 }} type="flex">
              <Link to={{ pathname: `/author/${this.state.item.owner}` }}>作者的其它文字</Link>
              <Link style={{ marginLeft: 15 }} to={{ pathname: `/tags/${this.state.item.tagid}` }}>同类文字</Link>
              <Link style={{ marginLeft: 15 }} to={{ pathname: `/lbs/${this.state.item.geoid}` }}>附近文字</Link>
            </Row>
          </div>
        </Spin>
        <Footer />
      </div>
    );
  }
}

IndexPage.propTypes = {
};

export default connect((state) => {
  return {
    reward: state.main.reward,
    signCode: state.main.signCode,
    balance: state.main.balance,
    price: state.main.price,
    priceCNY: state.main.priceCNY,
  };
})(IndexPage);
