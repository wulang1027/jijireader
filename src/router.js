import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import IndexPage from './routes/IndexPage';
import NewInfoPage from './routes/NewInfoPage';
import DetailPage from './routes/DetailPage';
import BuyPage from './routes/BuyPage';
import HotPage from './routes/HotPage';
import MapPage from './routes/MapPage';
import TagsPage from './routes/TagsPage';
import LBSPage from './routes/LBSPage';
import AuthorPage from './routes/AuthorPage';
import BuyedPage from './routes/BuyedPage';
import SellPage from './routes/SellPage';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={IndexPage} />
        <Route path="/newinfo" exact component={NewInfoPage} />
        <Route path="/buy" exact component={BuyPage} />
        <Route path="/sell" exact component={SellPage} />
        <Route path="/hot" exact component={HotPage} />
        <Route path="/map" exact component={MapPage} />
        <Route path="/detail/:id" exact component={DetailPage} />
        <Route path="/tags/:id" exact component={TagsPage} />
        <Route path="/lbs/:id" exact component={LBSPage} />
        <Route path="/buyed/" exact component={BuyedPage} />
        <Route path="/author/:id" exact component={AuthorPage} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
