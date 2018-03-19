import React from 'react';
import { connect } from 'dva';

import { Row, Col } from 'antd/lib/grid';
import 'antd/lib/grid/style';

import { compose, withProps } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

import { routerRedux } from 'dva/router';

import styles from './IndexPage.css';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

const geohash = require('ngeohash');

const jumpTo = (dispatch, geo) => {
  dispatch(routerRedux.push({ pathname: `/lbs/${geo}` }));
};

const MyMapComponent = compose(
  withProps({
    googleMapURL: 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyBqEzZnauhz51GBv0rUbsHXa_aMzpZzjSg',
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '400px' }} />,
    mapElement: <div style={{ height: '100%' }} />,
  }),
  withScriptjs,
  withGoogleMap,
)(props =>
  (<GoogleMap
    defaultZoom={1}
    defaultCenter={{ lat: -34.397, lng: 150.644 }}
  >
    {props.children}
  </GoogleMap>),
);

class IndexPage extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: 'main/geos', payload: {} });
  }

  render() {
    const markers = (this.props.geos || []).map((geo, idx) => {
      const newpos = geohash.decode(geo.geo);
      return (
        <Marker
          key={idx}
          position={{ lat: newpos.latitude, lng: newpos.longitude }}
          onClick={jumpTo.bind(null, this.props.dispatch, geo.id)}
        />
      );
    });
    return (
      <Row className={styles.normal} type="flex">
        <Col type="flex" style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'stretch' }}>
          <Header />

          <MyMapComponent>
            {markers}
          </MyMapComponent>

          <Footer />
        </Col>
      </Row>
    );
  }
}

IndexPage.propTypes = {
};

export default connect((state) => { return { geos: state.main.geos }; })(IndexPage);
