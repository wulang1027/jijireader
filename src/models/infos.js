import * as services from '../services/main';

export default {

  namespace: 'main',

  state: { tx: [], tags: [], loading: false },

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
      dispatch({ type: 'balanceFetch', payload: {} });
      dispatch({ type: 'priceFetch', payload: {} });
      dispatch({ type: 'rewardFetch', payload: {} });
      dispatch({ type: 'totalFetch', payload: {} });
      dispatch({ type: 'allowSell', payload: {} });
      dispatch({ type: 'tagsFetch', payload: {} });
    },
  },

  effects: {
    *list({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { loading: true } });
      if (!payload.begin) {
        const data = yield call(services.totalInfos, payload);
        yield put({ type: 'save', payload: data });
        payload.begin = data.total; // eslint-disable-line
      }
      const data = yield call(services.list, payload);
      const infos = yield call(services.scores, data);
      yield put({ type: 'save', payload: infos });
      yield put({ type: 'save', payload: { loading: false } });
    },
    *hot({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { loading: true } });
      const data = yield call(services.hot, payload);
      const infos = yield call(services.scores, data);
      yield put({ type: 'save', payload: infos });
      yield put({ type: 'save', payload: { loading: false } });
    },
    *tag({ payload }, { call, put, select }) {
      yield put({ type: 'save', payload: { loading: true } });
      if (!payload.begin) {
        let alltag = yield select(state => state.main.tags);
        if (!alltag || alltag.length === 0) {
          const data = yield call(services.tags, payload);
          const tagsWithTotal = yield call(services.tagsTotal, data);
          yield put({ type: 'save', payload: tagsWithTotal });
          alltag = yield select(state => state.main.tags);
        }
        const mytag = alltag.filter(item => item.id === payload.id);
        payload.begin = mytag[0].total.toNumber(); // eslint-disable-line
      }
      const data = yield call(services.tag, payload);
      const infos = yield call(services.scores, data);
      yield put({ type: 'save', payload: infos });
      yield put({ type: 'save', payload: { loading: false } });
    },

    *buyed({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { loading: true } });
      const total = yield call(services.buyedTotal);
      if (total <= 0) {
        yield put({ type: 'save', payload: { infos: [] } });
        yield put({ type: 'save', payload: { loading: false } });
        return;
      }
      if (!payload.begin) {
        payload.begin = total.toNumber(); // eslint-disable-line
      }
      const data = yield call(services.buyed, payload);
      const infos = yield call(services.scores, data);
      yield put({ type: 'save', payload: infos });
      yield put({ type: 'save', payload: { loading: false } });
    },

    *author({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { loading: true } });
      const total = yield call(services.authorTotal, payload.id);
      if (total <= 0) {
        yield put({ type: 'save', payload: { infos: [] } });
        yield put({ type: 'save', payload: { loading: false } });
        return;
      }
      if (!payload.begin) {
        payload.begin = total.toNumber(); // eslint-disable-line
      }
      const data = yield call(services.author, payload);
      const infos = yield call(services.scores, data);
      yield put({ type: 'save', payload: infos });
      yield put({ type: 'save', payload: { loading: false } });
    },
    *lbs({ payload }, { call, put, select }) {
      yield put({ type: 'save', payload: { loading: true } });
      if (!payload.begin) {
        let allgeo = yield select(state => state.main.geos);
        if (!allgeo || allgeo.length === 0) {
          const data = yield call(services.geos, payload);
          const geosWithTotal = yield call(services.geosTotal, data);
          yield put({ type: 'save', payload: geosWithTotal });
          allgeo = yield select(state => state.main.geos);
        }
        const mygeo = allgeo.filter(item => item.id === payload.id);
        payload.begin = mygeo[0].total.toNumber(); // eslint-disable-line
      }
      const data = yield call(services.geo, payload);
      const infos = yield call(services.scores, data);
      yield put({ type: 'save', payload: infos });
      yield put({ type: 'save', payload: { loading: false } });
    },

    *allowSell({ payload }, { call, put }) {
      const data = yield call(services.allowSell, payload);
      yield put({ type: 'save', payload: data });
    },

    *balanceFetch({ payload }, { call, put }) {
      const data = yield call(services.balance, payload);
      yield put({ type: 'save', payload: data });
    },
    *tagsFetch({ payload }, { call, put }) {
      const data = yield call(services.tags, payload);
      const tagsWithTotal = yield call(services.tagsTotal, data);
      yield put({ type: 'save', payload: tagsWithTotal });
    },
    *geos({ payload }, { call, put }) {
      const data = yield call(services.geos, payload);
      const geosWithTotal = yield call(services.geosTotal, data);
      yield put({ type: 'save', payload: geosWithTotal });
    },
    *totalFetch({ payload }, { call, put }) {
      const data = yield call(services.totalInfos, payload);
      yield put({ type: 'save', payload: data });
    },
    *priceFetch({ payload }, { call, put }) {
      const data = yield call(services.price, payload);
      yield put({ type: 'save', payload: data });
    },
    *rewardFetch({ payload }, { call, put }) {
      const data = yield call(services.reward, payload);
      yield put({ type: 'save', payload: data });
    },
  },

  reducers: {
    addtx(state, action) {
      state.tx = [].concat(action.payload).concat(state.tx); // eslint-disable-line
      return { ...state };
    },

    rmtx(state, action) {
      state.tx = state.tx.filter((item) => {return item.tx != action.payload.tx}); // eslint-disable-line
      if (action.payload.callback) action.payload.callback();
      return { ...state };
    },

    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
