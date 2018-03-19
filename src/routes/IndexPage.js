import React from 'react';
import { connect } from 'dva';

import { Row, Col } from 'antd/lib/grid';
import 'antd/lib/grid/style';

import Pagination from 'antd/lib/pagination';
import 'antd/lib/pagination/style';

import styles from './IndexPage.css';
import Header from '../components/Header.js';
import Contents from '../components/Contents.js';
import Footer from '../components/Footer.js';


class IndexPage extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: 'main/list', payload: {} });
  }

  render() {
    return (
      <Row className={styles.normal} type="flex">
        <Col type="flex" style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'stretch' }}>
          <Header />
          <Contents />
          <Row type="flex" justify="center" style={{ paddingRight: 30 }}>
            <Pagination pageSize={10} total={this.props.total || 0} />
          </Row>
          <Footer />
        </Col>
      </Row>
    );
  }
}

IndexPage.propTypes = {
};

export default connect((state) => {
  return { total: state.main.total };
})(IndexPage);
