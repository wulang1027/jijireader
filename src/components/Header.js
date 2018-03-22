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
          <NavIcon to="/" type="home" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <NavIcon to="/hot" type="rocket" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <NavIcon to="/map" type="environment-o" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <NavIcon to="/random" type="gift" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <NavIcon to="/tags" type="tags-o" style={{ color: '#cccc' }} />
        </Col>
        <Col type="flex" style={{ marginLeft: 30, flex: 1 }} />
        <Row type="flex" justify="end" align="middle">
          <Col type="flex" style={{ marginRight: 30, fontSize: 12, color: '#cccc' }}>
            <Link to={{ pathname: '/buy' }}>{balance} JI</Link>
          </Col>
          <NavIcon to="/buyed" type="shopping-cart" style={{ color: '#cccc' }} />
          <NavIcon to="/newinfo" type="form" style={{ color: '#cccc', margin: '0 30px' }} />
          {this.props.tx.length ?
            <Badge count={this.props.tx.length}>
              <span style={{ color: '#cccc', fontSize: 16, marginLeft: 30 }} >{this.props.tx.length}</span>
            </Badge>
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
