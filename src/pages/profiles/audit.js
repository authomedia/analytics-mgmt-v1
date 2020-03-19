import Page from '../page';
import events from '../../config/events';
import ProfilesAuditFormControl from '../../components/forms/profiles-audit-form-control';

class ProfilesAuditPage extends Page {
  constructor() {
    super();
    this.formControl = new ProfilesAuditFormControl();
  }

  init() {
    super.init();
    this.formControl.init();
    this.formControl.accounts.init();
  }
}

export default () => {
  $(function() {
    const page = new ProfilesAuditPage();

    $(window).on(events.GOOGLE.AUTHORIZED, function() {
      page.init();
    })
  });
}
