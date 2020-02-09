import SelectField from './select-field';
import events from '../../config/events';

class AccountsField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'Accounts';

    this.handleChange((i, elem) => {
      this.formControl.emit(events.FIELDS.ACCOUNTS.CHANGE, {
        i: i,
        elem: elem
      });
    });
  }

  init() {
    super.init();
    gapi.client.load('analytics', 'v3').then(() => {
      gapi.client.analytics.management.accounts.list().then((response) => {
        this.handleResult(response);
      });
    });
  }

  handleResult(response) {
    super.handleResult(
      response.result.items,
      this.field,
      'name',
      'id',
      [],
      this.translate.analytics.errors[`no${this.className}`],
      {
        empty: true
      }
    );
  }
}

export default AccountsField;
