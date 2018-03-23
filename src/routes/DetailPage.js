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
import Footer from '../components/Footer.js';

const infolib = require('../lib/info');
const eth = require('../lib/ethereum');

const ReactMarkdown = require('react-markdown');
const NavIcon = require('../components/navicon');
const Header = require('../components/Header');

class IndexPage extends React.Component {
  state = {
    item: {
      title: '正在加载中...',
      public: '',
      private: '',
      position: '',
      price: '',
    },
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen((location) => {
      if (location.pathname.startsWith('/detail/')) {
        this.loadEvent(location.pathname.substr(8), this.props.signCode);
      }
    });
  }

  componentDidMount() {
    const markdownCallback = {
      link: this.renderArticleLink.bind(this),
    };
    infolib.bindRender(markdownCallback);
  }

  componentWillUnmount() {
    this.unlisten();
  }

  loadEvent(id, code, seed) {
    this.props.dispatch({ type: 'main/save', payload: { loading: true } });
    eth.event(id, code || this.props.signCode, seed ||
      this.props.seed, this.state.item, (err, item) => {
        this.props.dispatch({ type: 'main/save', payload: { loading: false } });
        if (err) {
          message.error(err);
        } else {
          this.setState({
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

  renderArticleLink(props) {
    if (!props.href.startsWith('__JI__')) {
      return <a href={props.href}>{props.children}</a>;
    }
    const cmd = props.href.substr(6);
    if (cmd === 'signcode') {
      return (<span
        className={styles.link}
        onClick={() => {
          eth.encryptKey((err, code, seed) => {
            if (code) {
              this.props.dispatch({ type: 'main/save', payload: { signCode: code, seed } });
              this.loadEvent(this.props.match.params.id, code, seed);
            }
          });
        }}
      >
        { props.children }
      </span>);
    } else if (cmd === 'buyji') {
      return <Link to={{ pathname: '/buy' }}>{props.children}</Link>;
    } else if (cmd === 'buy') {
      return (<span
        className={styles.link}
        style={{ marginRight: 15 }}
        onClick={() => {
          eth.getAccounts((err, accounts) => {
            eth.rwContract.buyInfo(this.state.item.id, { from: accounts[0] })
            .then((tx) => {
              this.props.dispatch({
                type: 'main/addtx',
                payload: {
                  tx,
                  callback: () => {
                    this.loadEvent(this.props.match.params.id,
                      this.props.signCode, this.props.seed).bind(this);
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
      >{props.children}
      </span>);
    } else if (cmd === 'howtobuy') {
      return <Link to={{ pathname: '/detail/e3b356ab67be8453e465fc904d3eefb22d0983420d08be3c9bc40ba4d0aa68ca' }}>{props.children}</Link>;
    } else if (cmd === 'rank') {
      return (<span style={{ marginTop: 50 }}>
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
        />{props.children}
      </span>);
    }
    return <a href={props.href}>{props.children}</a>;
  }

  /* global document */
  render() {
    if (this.state.item.title) {
      document.title = `${this.state.item.title} --- 潘多拉文字社区`;
    }

    const price = this.props.price ?
    (eth.toBigNumber(this.props.price) /
    eth.toBigNumber('1000000000000000000')).toFixed(5) : 0;
    const cny = ((this.props.priceCNY * price) * this.state.item.price) /
    eth.toBigNumber('1000000000000000000');

    const priceMemo = ` **（${(this.state.item.price / eth.toBigNumber('1000000000000000000')).toFixed(0)}Ji ，${cny.toFixed(2)}¥)**`;
    let extra = '';
    if (!eth.web3) {
      extra = '[怎么购买](__JI__howtobuy)';
    } else if (!this.state.item.buyed && (this.props.balance - this.state.item.price) >= eth.toBigNumber('0')) {
      extra = '[购买付费部分](__JI__buy)';
    } else if (!this.state.item.buyed && (this.props.balance - this.state.item.price) < eth.toBigNumber('0')) {
      extra = '您的余额不足，[马上购买](__JI__buyji)';
    } else if (!this.props.signCode && this.state.item.buyed) {
      extra = '您已购买此文章，[点这里授权显示相关内容](__JI__signcode)';
    }
    const artile = { ...this.state.item };
    if (this.state.item.price) {
      artile.public += (this.state.item.price ? priceMemo : '') + (extra ? `，${extra}` : '');
    }

    return (
      <div className={styles.normal}>
        <Header />
        <Spin size="large" spinning={this.props.loading}>
          <div className={styles.content}>
            <ReactMarkdown
              className={styles.article}
              source={infolib.mixPreview(artile)}
              renderers={infolib.mdrender()}
            />
            <Row type="flex" justify="center" style={{ marginTop: 40 }} >
              <NavIcon
                to="/"
                title="主页"
                type="home"
              />
              <NavIcon
                to="/newinfo"
                title="发表新内容"
                type="form"
              />
              <div style={{ width: 20 }} />
              <NavIcon
                to={`/author/${this.state.item.owner}`}
                title="作者的其他内容"
                type="contacts"
              />
              <NavIcon
                to={`/tags/${this.state.item.tagid}`}
                title="同标签内容"
                type="tags-o"
              />
              <NavIcon
                to={`/lbs/${this.state.item.geoid}`}
                title="附近的内容"
                type="environment"
              />
              <div style={{ width: 20 }} />
              <NavIcon
                onClick={this.like.bind(this)}
                disabled={!this.props.signCode ||
                          !this.state.item.private ||
                          !this.state.item.canRank}
                type="like-o"
              />
              <NavIcon
                onClick={this.dislike.bind(this)}
                disabled={!this.props.signCode ||
                  !this.state.item.private ||
                  !this.state.item.canRank}
                type="dislike-o"
              />
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
    seed: state.main.seed,
    balance: state.main.balance,
    price: state.main.price,
    loading: state.main.loading,
    priceCNY: state.main.priceCNY,
  };
})(IndexPage);
