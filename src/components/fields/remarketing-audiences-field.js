import SelectField from './select-field';
import events from '../../config/events';

class RemarketingAudiencesField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'RemarketingAudiences';

    this.handleChange((i, elem) => {
      this.formControl.emit(events.FIELDS.REMARKETING_AUDIENCES.CHANGE, {
        i: i,
        elem: elem
      });
    });

    this.formControl.on(events.FIELDS.ACCOUNTS.CHANGE, (event) => {
      this.empty();
    });

    this.formControl.on(events.FIELDS.PROPERTIES.CHANGE, (event) => {
      this.empty();
    });
  }

  init(accountId, propertyId, propertyName) {
    super.init();
    gapi.client.analytics.management.remarketingAudience.list({
      'accountId': accountId,
      'webPropertyId': propertyId
    })
    .then((response) => {
      response.parentName = propertyName;
      this.handleResult(response)
    })
    .then(null, (err) => {
      this.handleError(err);
    });
  }

  handleResult(response) {
    super.handleResult(
      response.result.items,
      this.field,
      'name',
      'id',
      [
        'linkedViews',
        'linkedAdAccounts'
      ],
      this.translate.analytics.errors[`no${this.className}`],
      {
        parentName: response.parentName
      }
    );
  }
}

export default RemarketingAudiencesField;
