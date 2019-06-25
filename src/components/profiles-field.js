import SelectField from './select-field';

class ProfilesField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'Profiles';

    // this.handleChange((i, elem) => {
    //   this.formControl.profiles.empty();
    //   this.formControl.remarketingAudiences.empty();
    //   this.formControl.linkedAdAccounts.empty();
    //   this.formControl.adLinks.empty();

    //   this.formControl.profiles.init($(elem).data('accountId'), $(elem).val(), $(elem).text());
    //   this.formControl.adLinks.init($(elem).data('accountId'), $(elem).val(), $(elem).text());
    // });
  }

  init(accountId, propertyId, propertyName) {
    gapi.client.analytics.management.profiles.list({
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
      ['accountId'],
      this.translate.analytics.errors[`no${this.className}`],
      {
        parentName: response.parentName
      }
    );
  }
}

export default ProfilesField;
