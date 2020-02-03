import SelectField from './select-field';

class ProfilesField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'Profiles';

    // Initialize with empty callback for n of n selected behaviour
    this.handleChange((i, elem) => { });
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
      this.handleError(`${propertyName}: ${err}`);
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
