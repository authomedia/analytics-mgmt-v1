import ui from '../config/ui';
import Toast from './toast';
import i18n from '../config/i18n';
import ModelBase from '../models/model-base';

import RemarketingAudience from '../models/remarketing-audience';

class Analytics extends ModelBase {
  constructor(clientId, scopes) {
    super();

    this.clientId = clientId;
    this.scopes = scopes;
  }

  createRemarketingAudience(profile) {
    let remarketingAudience = new RemarketingAudience(profile);
    remarketingAudience.create();
  }
}

export default Analytics;
