import React from 'react';
import { connect } from 'dva';

import { Row, Col } from 'antd/lib/grid';
import 'antd/lib/grid/style';

import styles from './IndexPage.css';
import Header from '../components/Header.js';
import Contents from '../components/Contents.js';
import Footer from '../components/Footer.js';

class IndexPage extends React.Component {
  componentWillMount() {
    this.unlisten = this.props.history.listen((location) => {
      if (location.pathname.startsWith('/author/')) {
        this.props.dispatch({ type: 'main/author', payload: { id: location.pathname.substr(8) } });
      }
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    return (
      <Row className={styles.normal} type="flex">
        <Col type="flex" style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'stretch' }}>
          <Header />
          <Contents />
          <Footer />
        </Col>
      </Row>
    );
  }
}

IndexPage.propTypes = {
};

export default connect()(IndexPage);
