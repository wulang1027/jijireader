import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import { Row, Col } from 'antd/lib/grid';
import 'antd/lib/grid/style';

import Input from 'antd/lib/input';
import 'antd/lib/input/style';

import message from 'antd/lib/message';
import 'antd/lib/message/style';

import Spin from 'antd/lib/spin';
import 'antd/lib/spin/style';

import Button from 'antd/lib/button';
import 'antd/lib/button/style';

import Tooltip from 'antd/lib/tooltip';
import 'antd/lib/tooltip/style';

import InputNumber from 'antd/lib/input-number';
import 'antd/lib/input-number/style';

import Select from 'antd/lib/select';
import 'antd/lib/select/style';

import styles from './NewInfoPage.css';

import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

const { TextArea } = Input;
const Option = Select.Option;
const geohash = require('ngeohash');
const ReactMarkdown = require('react-markdown');
const request = require('superagent');

const infolib = require('../lib/info');
const eth = require('../lib/ethereum');

const constant = require('../lib/statics');

function FormRow(props) {
  return (
    <Row justify="center" type="flex" align={props.align || 'middle'} style={props.style || { marginBottom: 10 }} >{props.children}</Row>
  );
}

class IndexPage extends React.Component {
  state = { price: 1 }
  checkInputValid() {
    return this.state.title && this.state.public && this.state.private &&
      this.state.price && this.state.tag && this.state.position;
  }

  submitIPFS(callback) {
    request.post('https://ipfs.infura.io:5001/api/v0/add?stream-channels=true')
      .set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundaryXFdg6lEHYyjt5kpA')
      .send(`------WebKitFormBoundaryXFdg6lEHYyjt5kpA
Content-Disposition: file; filename="public"
Content-Type: application/octet-stream

${this.state.public}

付费内容包含${this.state.private.length}个字符
------WebKitFormBoundaryXFdg6lEHYyjt5kpA
Content-Disposition: file; filename="private"
Content-Type: application/octet-stream

${this.state.private}
------WebKitFormBoundaryXFdg6lEHYyjt5kpA--`)
        .responseType('arraybuffer')
        .end((err, res) => {
          /* global TextDecoder */
          const enc = new TextDecoder();
          const body = enc.decode(res.body);
          const hashes = body.trim().split('\n').map((line) => {
            return JSON.parse(line);
          });
          request.post(`${constant.encrypt}/encrypt`)
          .send({ cnt: hashes[1].Hash })
          .end((encryptErr, encryptRes) => {
            const info = hashes.slice(0);
            info[1].Hash = encryptRes.body.cnt;
            callback(err, info);
          });
        });
  }

  submitWeb3(files) {
    eth.getAccounts((err, accounts) => {
      eth.rwContract.newInfo(this.state.title, files[0].Hash, `0x${files[1].Hash}`,
        this.state.price * eth.toBigNumber('1000000000000000000'), this.state.tag, this.state.position,
        { from: accounts[0] },
      )
        .then((tx) => {
          message.success('文章已发布，但队列确认还需要时间');
          this.props.dispatch({ type: 'main/addtx', payload: { tx } });
          this.props.dispatch({ type: 'tagsFetch', payload: {} });
          this.props.dispatch(routerRedux.replace({ pathname: '/' }));
        })
        .catch((err2) => {
          message.error('用户取消或者发送失败！', err2);
        });
    });
  }

  render() {
    const options = this.props.tags ? this.props.tags.map(item => item.tag) : ['短篇小说', '本地信息'];
    if (!this.state.tag) this.state.tag = options[0];

    let jumpurl;
    if (this.state.position) {
      const newpos = geohash.decode(this.state.position);
      jumpurl = `http://maps.google.com/maps?q=${newpos.latitude},${newpos.longitude}`;
    }
    const info = {
      title: this.state.title,
      price: this.state.price,
      public: this.state.public,
      private: this.state.private,
      tag: this.state.tag,
    };
    const price = this.props.price ?
    (eth.toBigNumber(this.props.price) /
      eth.toBigNumber('1000000000000000000')).toFixed(5) : 0;
    const cny = this.props.priceCNY * price * this.state.price;
    return (
      <div className={styles.normal} >
        <Header />
        <Spin size="large" spinning={this.props.loading}>
          <Row style={{ margin: 20 }}>
            <Col span={12} style={{ padding: 10, borderRight: 'dashed 1px black' }} >
              <FormRow>
                <Col span={6}> <Row type="flex" align="middle" justify="end" className={styles.label}>标题：</Row> </Col>
                <Col span={18}> <Row type="flex" align="middle" justify="start" className={styles.input}>
                  <Input
                    style={{ width: 500 }}
                    value={this.state.title}
                    onChange={(e) => {
                      this.setState({ title: e.target.value });
                    }}
                  />
                </Row> </Col>
              </FormRow>
              <FormRow align="top" >
                <Col span={6}> <Row type="flex" align="middle" justify="end" className={styles.label}>公开内容：</Row> </Col>
                <Col span={18}> <Row type="flex" align="middle" justify="start" className={styles.input}>
                  <TextArea
                    autosize={{ minRows: 10 }}
                    style={{ width: 500 }}
                    value={this.state.public}
                    onChange={(e) => {
                      this.setState({ public: e.target.value });
                    }}
                  /></Row> </Col>
              </FormRow>
              <FormRow align="top" >
                <Col span={6}> <Row type="flex" align="middle" justify="end" className={styles.label}>付费内容：</Row> </Col>
                <Col span={18}> <Row type="flex" align="middle" justify="start" className={styles.input}>
                  <TextArea
                    autosize={{ minRows: 10 }}
                    style={{ width: 500 }}
                    value={this.state.private}
                    onChange={(e) => {
                      this.setState({ private: e.target.value });
                    }}
                  /></Row> </Col>
              </FormRow>
              <FormRow>
                <Col span={6}> <Row type="flex" align="middle" justify="end" className={styles.label}>价格：</Row> </Col>
                <Col span={18}> <Row type="flex" align="middle" justify="start" className={styles.input}>
                  <InputNumber
                    min={1}
                    max={100}
                    step={1}
                    style={{ width: 100 }}
                    value={this.state.price}
                    onChange={(value) => {
                      this.setState({ price: value });
                    }}
                  />
                  <span style={{ marginLeft: 10 }}> 价值人民币: { cny.toFixed(2) } 元 </span>
                </Row> </Col>
              </FormRow>
              <FormRow>
                <Col span={6}> <Row type="flex" align="middle" justify="end" className={styles.label}>分类标签：</Row> </Col>
                <Col span={18}> <Row type="flex" align="middle" justify="start" className={styles.input}>
                  <Select
                    style={{ width: 150 }}
                    mode="combobox"
                    defaultValue={options[0]}
                    onChange={(value) => {
                      this.setState({ tag: value.trim() });
                    }}
                  >
                    {options.map((item) => {
                      return (<Option key={item}>{item}</Option>);
                    })}
                  </Select>
                </Row> </Col>
              </FormRow>
              <FormRow>
                <Col span={6}> <Row type="flex" align="middle" justify="end" className={styles.label}>位置：</Row> </Col>
                <Col span={18}> <Row type="flex" align="middle" justify="start" className={styles.input}>
                  {
                    this.state.position ?
                      <a href={jumpurl} rel="noopener noreferrer" target="_blank">{this.state.position}</a> :
                      this.state.loaddingPos ? <Spin /> :
                      <Tooltip title="提供位置有利于将您的信息推送给附近的读者">
                        <Button
                          onClick={() => {
                            /* global navigator */
                            const geoSuccess = (_position) => {
                              this.setState({ position: geohash.encode(_position.coords.latitude,
                                _position.coords.longitude, 5),
                                loaddingPos: false });
                            };
                            const geoError = (error) => {
                              message.error(`无法获取您的位置信息：${error.code}`);
                              this.setState({ loaddingPos: false });
                            };
                            this.setState({ loaddingPos: true });
                            navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
                          }}
                        >点我获取您的大概位置（极低精度，可校验）</Button>
                      </Tooltip>
                  }
                </Row> </Col>
              </FormRow>
              <FormRow style={{ marginTop: 50 }}>
                <Button
                  style={{ marginRight: 10 }}
                  onClick={() => {
                    this.props.dispatch(routerRedux.replace({ pathname: '/' }));
                  }}
                >取消</Button>
                <Button
                  onClick={() => {
                    if (!this.checkInputValid()) {
                      message.error('输入不合法，任何字段都必须要填写，请检查您的输入！');
                      return;
                    }
                    this.props.dispatch({ type: 'main/save', payload: { loading: true } });
                    this.submitIPFS((err, files) => {
                      this.props.dispatch({ type: 'main/save', payload: { loading: false } });
                      if (err) {
                        message.error('提交到IPFS时失败！');
                      } else {
                        this.submitWeb3(files);
                      }
                    });
                  }}
                >创建（提交以后无法修改）</Button>
              </FormRow>
            </Col>
            <Col span={12} style={{ padding: 10 }}>
              <ReactMarkdown escapeHtml={false} source={infolib.mixPreview(info)} />
            </Col>
          </Row>
        </Spin>
        <Footer />
      </div>
    );
  }
}

IndexPage.propTypes = {
};

/*
const ipfs=require('ipfs-api')('ipfs.infura.io', '5001', {protocol: 'https'});
const files = [
  {
    path: 'public',
    content: Buffer.from('hi public'),
  },
  {
    path: 'private',
    content: Buffer.from('hi private'),
  },
]

ipfs.files.add(files, function (err, files) {
  // 'files' will be an array of objects containing paths and the multihashes of the files added
})*/


export default connect((state) => {
  return {
    tags: state.main.tags,
    price: state.main.price,
    priceCNY: state.main.priceCNY,
    loading: state.main.loading,
  };
})(IndexPage);
