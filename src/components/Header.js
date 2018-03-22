import React from 'react';
import { Link } from 'dva/router';
import { connect } from 'dva';
import { Row, Col } from 'antd/lib/grid';
import 'antd/lib/grid/style';

import Badge from 'antd/lib/badge';
import 'antd/lib/badge/style';

const eth = require('../lib/ethereum');
const NavIcon = require('../components/navicon');

class Example extends React.Component {
  componentDidMount() {
    setInterval(() => {
      if (this.props.tx.length > 0) {
        const needcheck = this.props.tx[0];
        eth.checkTx(needcheck.tx, (err, tx) => {
          if (tx && tx.blockNumber) {
            this.props.dispatch({ type: 'main/rmtx', payload: needcheck });
          }
        });
      }
    }, 5000);
  }
  render() {
    const balance = this.props.balance ? (eth.toBigNumber(this.props.balance) / eth.toBigNumber(1000000000000000000)).toFixed(3).toString() : '0';
    return (
      <Row style={{ backgroundColor: 'black', height: 26 }} align="middle" type="flex">
        <Col type="flex" style={{ marginLeft: 30 }}>
          <NavIcon to="/" type="home" title="主页" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <NavIcon to="/hot" type="rocket" title="热门文章" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <NavIcon to="/map" type="environment-o" title="文字地图" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <NavIcon to="/random" type="gift" title="试试运气" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <NavIcon to="/tags" type="tags-o" title="所有标签" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30, flex: 1 }} />
        <Row type="flex" justify="end" align="middle">
          <Col type="flex" style={{ marginRight: 30, fontSize: 12, color: '#cccc' }}>
            <Link to={{ pathname: '/buy' }} title="购买 Ji 币" >{balance} JI</Link>
          </Col>
          <NavIcon to="/buyed" title="已购买的内容" type="shopping-cart" style={{ color: '#cccc' }} />
          <NavIcon to="/newinfo" title="发表新内容" type="form" style={{ color: '#cccc', margin: '0 30px' }} />
          {this.props.tx.length ?
            <span style={{ marginRight: 30 }}>
              <Badge count={this.props.tx.length}>
                <span style={{ color: '#cccc', fontSize: 16 }} >{this.props.tx.length}</span>
              </Badge>
            </span>
          : null}
        </Row>
      </Row>
    );
  }
}

Example.propTypes = {
};

export default connect((state) => {
  return {
    balance: state.main.balance,
    tx: state.main.tx,
    tags: state.main.tags,
  };
})(Example);

/**
          <Dropdown overlay={menu}>
            <div>账户余额: {balance} 唧唧币 <Icon type="down" /></div>
          </Dropdown>

  <Col type="flex" style={{ marginLeft: 30, backgroundColor: 'white' }}>
    <Row type="flex" justify="center" align="middle">
      <Dropdown overlay={tagMenu}>
        <div>所有标签 <Icon type="down" /></div>
      </Dropdown>
    </Row>
  </Col>

 */
