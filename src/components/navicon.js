import React from 'react';

import { Link } from 'dva/router';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style';

import styles from '../routes/DetailPage.css';

export default (props) => {
  if (props.to && !props.disabled) {
    return (
      <Link to={props.to}>
        <Icon
          className={styles.link}
          style={{ color: props.disabled ? '#cccccccc' : '#0006', fontSize: 20, marginRight: 25 }}
          {...props}
        />
      </Link>
    );
  }
  return (
    <Icon
      className={styles.link}
      style={{ color: props.disabled ? '#cccccccc' : '#0006', fontSize: 20, marginRight: 25 }}
      {...props}
    />);
};
