import ui from '../config/ui';
import Toast from './ui/toast';
import i18n from '../config/i18n';
import ModelBase from '../models/model-base';

import RemarketingAudience from '../models/remarketing-audience';
import CustomDimension from '../models/custom-dimension';

class Analytics extends ModelBase {
  constructor(clientId, scopes) {
    super();

    this.translate = i18n[process.env.LOCALE];

    this.clientId = clientId;
    this.scopes = scopes;
  }

  createRemarketingAudience(profile, formControl) {
    let remarketingAudience = new RemarketingAudience(profile, formControl);
    remarketingAudience.create();
  }

  async findCustomDimension(accountId, webPropertyId, index) {
    console.log(arguments);
    return await CustomDimension.find(accountId, webPropertyId, index);
  }

  async listCustomDimensions(accountId, webPropertyId) {
    return await CustomDimension.all(accountId, webPropertyId);
  }

  createCustomDimension(profile, customDimension) {
    let customDimensionModel = new CustomDimension(profile);
    customDimensionModel.create(customDimension);
  }
}

export default Analytics;
