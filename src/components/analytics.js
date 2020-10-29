import ui from '../config/ui';
import Toast from './ui/toast';
import i18n from '../config/i18n';
import ModelBase from '../models/model-base';

import RemarketingAudience from '../models/remarketing-audience';
import CustomDimension from '../models/custom-dimension';
import CustomMetric from '../models/custom-metric';
import Profile from '../models/profile';
import Goal from '../models/goal';

class Analytics extends ModelBase {
  constructor(clientId, scopes) {
    super();

    this.translate = i18n[process.env.LOCALE];

    this.clientId = clientId;
    this.scopes = scopes;
  }

  listRemarketingAudiences(profile, formControl) {
    let remarketingAudience = new RemarketingAudience(profile, formControl);
    remarketingAudience.list();
  }

  createRemarketingAudience(profile, formControl) {
    let remarketingAudience = new RemarketingAudience(profile, formControl);
    remarketingAudience.create();
  }

  async findCustomDimension(accountId, webPropertyId, index) {
    console.log(arguments);
    return await CustomDimension.find(accountId, webPropertyId, index);
  }

  async findCustomMetric(accountId, webPropertyId, index) {
    console.log(arguments);
    return await CustomMetric.find(accountId, webPropertyId, index);
  }

  async listCustomDimensions(accountId, webPropertyId) {
    return await CustomDimension.all(accountId, webPropertyId);
  }

  async listCustomMetrics(accountId, webPropertyId) {
    return await CustomMetric.all(accountId, webPropertyId);
  }

  async listProfiles(accountId, webPropertyId) {
    return await Profile.all(accountId, webPropertyId);
  }


  async listGoals(accountId, webPropertyId, profileId) {
    return await Goal.all(accountId, webPropertyId, profileId);
  }

  async createGoal(profile, goal, live) {
    let goalModel = new Goal(profile, goal, live);
    await goalModel.create();
  }

  async upsertGoal(profile, goal, live) {
    let goalModel = new Goal(profile, goal, live);
    await goalModel.upsert(false);
  }

}

export default Analytics;
