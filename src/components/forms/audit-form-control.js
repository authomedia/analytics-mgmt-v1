import FormControlBase from './form-control-base';
import TableGenerator from '../../utilities/table-generator';
import Analytics from '../../components/analytics'
import AccountsField from '../../components/accounts-field';
import PropertiesField from '../../components/properties-field';

import events from '../../config/events';
import ui from '../../config/ui';
import db from '../../models/db';

const analytics = new Analytics(
  process.env.CLIENT_ID
  [process.env.SCOPES]
);

class AuditFormControl extends FormControlBase {
  constructor() {
    super();
    this.analytics = analytics;
    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);
  }
}

export default AuditFormControl;
