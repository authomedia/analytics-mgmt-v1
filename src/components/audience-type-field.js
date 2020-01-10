import SelectField from './select-field';

class AudienceTypeField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.handleChange((i, elem) => {
      elem = $(elem);

      if (elem.val() == 'SIMPLE') {
        this.showSimpleAudienceTypeTabs();
      }

      if (elem.val() == 'STATE_BASED') {
        this.showStateBasedAudienceTypeTabs();
      }
    })
  }

  init() {
    this.showSimpleAudienceTypeTabs();
  }

  showSimpleAudienceTypeTabs() {
    $('.ga-remarketing-audience-type-simple-tab').show();
    $('.ga-remarketing-audience-type-state-based-tab').hide();
    $('.ga-remarketing-audience-type-simple-tab a:first').tab('show');
    $('#ga-remarketing-audience-include-conditions').show();
    $('#ga-remarketing-audience-sb-include-conditions').hide();
    $('#ga-remarketing-audience-sb-include-conditions, #ga-remarketing-audience-sb-exclude-conditions').find('input, textarea').val(null);
  }

  showStateBasedAudienceTypeTabs() {
    $('.ga-remarketing-audience-type-simple-tab').hide();
    $('.ga-remarketing-audience-type-state-based-tab').show();
    $('.ga-remarketing-audience-type-state-based-tab a:first').tab('show');
    $('#ga-remarketing-audience-sb-include-conditions').show();
    $('#ga-remarketing-audience-include-conditions').hide();
    $('#ga-remarketing-audience-include-conditions, #ga-remarketing-audience-sb-exclude-conditions').find('input, textarea').val(null);
  }
}

export default AudienceTypeField;
