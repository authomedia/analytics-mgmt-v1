import SelectField from './select-field';

class PropertiesField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'Properties';

    this.handleChange((i, elem) => {
      this.formControl.profiles.empty();
      this.formControl.remarketingAudiences.empty();
      this.formControl.linkedAdAccounts.empty();
      this.formControl.adLinks.empty();

      if (elem) {
        this.formControl.profiles.init($(elem).data('accountId'), $(elem).val(), $(elem).text());
        this.formControl.adLinks.init($(elem).data('accountId'), $(elem).val(), $(elem).text());
      }
    });
  }

  init(accountId, accountName) {
    super.init();
    gapi.client.analytics.management.webproperties.list({
      'accountId': accountId
    })
      .then((response) => {
        response.parentName = accountName;
        this.handleResult(response)
      })
      .then(null, (err) => {
        this.handleError(`${accountName}: ${err}`);
    });
  }

  handleResult(response) {
    super.handleResult(
      response.result.items,
      this.field,
      'name',
      'id',
      ['accountId'],
      this.translate.analytics.errors[`no${this.className}`],
      {
        parentName: response.parentName
      }
    );
  }
}

export default PropertiesField;
