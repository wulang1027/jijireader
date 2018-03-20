import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';

import { Row, Col } from 'antd/lib/grid';
import 'antd/lib/grid/style';

import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style';

import Spin from 'antd/lib/spin';
import 'antd/lib/spin/style';

import styles from './Contents.css';

const eth = require('../lib/ethereum');

const Example = (props) => {
  const cols = (props.infos || [])
  .sort((a, b) => {
    return eth.toBigNumber(a.id) < eth.toBigNumber(b.id);
  })
  .map((item, idx) => {
    return (
      <Col key={idx} span={12}>
        <Row type="flex" style={{ padding: '15px 0' }}>
          <Col style={{ flex: 1, padding: '0 15px' }}>
            <Link
              to={{ pathname: `/detail/${item.transaction.substr(2)}` }}
            >
              <div className={styles.title}>{item.title}</div>
            </Link>
          </Col>
          <Col>
            <Link to={{ pathname: `/tags/${item.tagid}` }}>{item.tag}</Link>
          </Col>
          <Col style={{ marginLeft: 10 }}>
            <Row type="flex">
              <Icon type="like" />
              <span style={{ marginLeft: 5 }}> {item.like.toString(10)}</span>
            </Row>
          </Col>
          <Col style={{ marginLeft: 10 }}>
            <Row type="flex" align="middle">
              <Icon type="dislike" />
              <span style={{ marginLeft: 5 }}> {item.dislike.toString(10)}</span>
            </Row>
          </Col>
          <Col style={{ marginLeft: 10 }}>
            <Row type="flex" align="middle">
              <Icon type="pay-circle" />
              <span style={{ marginLeft: 5 }}>
                {(item.price / eth.toBigNumber(1000000000000000000)).toFixed(0)}
              </span>
            </Row>
          </Col>
        </Row>
      </Col>);
  });
  return (
    <Spin size="large" spinning={props.loading}>
      <div style={{ minHeight: 400, padding: 20 }}>
        <Row style={{ flex: 1, padding: 20 }}>
          {cols}
        </Row>
      </div>
    </Spin>
  );
};

Example.propTypes = {
};


export default connect((state) => {
  return {
    infos: state.main.infos,
    loading: state.main.loading,
  };
})(Example);
