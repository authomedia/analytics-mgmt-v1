import Logger from 'js-logger';

import ModelBase from '../models/model-base';

class Page extends ModelBase {
  constructor() {
    super();
  }

  init() {
    Logger.info('Page ready');
  }
}

export default Page;
