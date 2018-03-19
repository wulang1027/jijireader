import React from 'react';
import { Link } from 'dva/router';
import { connect } from 'dva';
import { Row, Col } from 'antd/lib/grid';
import 'antd/lib/grid/style';

import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style';

import Badge from 'antd/lib/badge';
import 'antd/lib/badge/style';

import Dropdown from 'antd/lib/dropdown';
import 'antd/lib/dropdown/style';

import Menu from 'antd/lib/menu';
import 'antd/lib/menu/style';

const eth = require('../lib/ethereum');

/* global web3 */
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
    const menu = (
      <Menu>
        <Menu.Item key="0">
          <Link to={{ pathname: '/buy' }}>购买 Ji 币</Link>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to={{ pathname: '/sell' }}>出售 Ji 币</Link>
        </Menu.Item>
        <Menu.Divider />
      </Menu>
    );
    const tags = (this.props.tags || []).map((item, idx) => {
      return (<Menu.Item key={idx}>
        <Link to={{ pathname: `/tags/${item.id}` }}>{item.tag}</Link>
      </Menu.Item>);
    });
    const tagMenu = (
      <Menu>
        {tags}
      </Menu>
    );
    const balance = this.props.balance ? (web3.toBigNumber(this.props.balance) / web3.toBigNumber(1000000000000000000)).toFixed(3).toString() : '0';
    return (
      <Row style={{ padding: '20px 0' }} align="middle" type="flex">
        <Col type="flex" style={{ marginLeft: 30 }}>
          <Link to={{ pathname: '/' }}>首页</Link>
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <Link to={{ pathname: '/hot' }}>热门文章</Link>
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <Link to={{ pathname: '/map' }}>文字地图</Link>
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <Link to={{ pathname: '/random' }}>I feel Lucky</Link>
        </Col>
        <Col type="flex" style={{ marginLeft: 30 }}>
          <Row type="flex" justify="center" align="middle">
            <Dropdown overlay={tagMenu}>
              <div>所有标签 <Icon type="down" /></div>
            </Dropdown>
          </Row>
        </Col>
        <Col type="flex" style={{ marginLeft: 30, flex: 1 }} />
        <Row type="flex" justify="end">
          <Dropdown overlay={menu}>
            <div>账户余额: {balance} 唧唧币 <Icon type="down" /></div>
          </Dropdown>
          <Link style={{ marginLeft: 20 }} to={{ pathname: '/buyed' }}>我购买的内容</Link>
          <Link style={{ margin: '0 20px' }} to={{ pathname: '/newinfo' }}>发布新内容</Link>
          <div style={{ marginRight: 20 }}>
            <Badge count={this.props.tx.length}>
              <Icon type="coffee" />
            </Badge>
          </div>
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
