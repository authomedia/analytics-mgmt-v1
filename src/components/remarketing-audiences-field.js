import SelectField from './select-field';

class RemarketingAudiencesField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'RemarketingAudiences';
  }

  init(accountId, propertyId, propertyName) {
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
