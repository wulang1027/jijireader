import React from 'react';
import { connect } from 'dva';

import { Row } from 'antd/lib/grid';
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
      <Row type="flex" className={styles.normal} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <Header />
        <Contents />
        <Row type="flex" justify="center" style={{ paddingRight: 30 }}>
          <Pagination pageSize={10} total={this.props.total || 0} />
        </Row>
        <Footer />
      </Row>
    );
  }
}

IndexPage.propTypes = {
};

export default connect((state) => {
  return { total: state.main.total };
})(IndexPage);
