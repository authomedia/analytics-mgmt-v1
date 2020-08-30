import Page from '../page';
import events from '../../config/events';
import RemarketingAudiencesFormControl from '../../components/forms/remarketing-audiences-form-control';

class RemarketingAudiencesIndexPage extends Page {
  constructor() {
    super();
    this.formControl = new RemarketingAudiencesFormControl();
  }

  init() {
    super.init();
    this.formControl.audienceType.init();
    this.formControl.init();
    this.formControl.accounts.init();
  }
}

export default () => {
  $(function() {
    const page = new RemarketingAudiencesIndexPage();

    $(window).on(events.GOOGLE.AUTHORIZED, function() {
      page.init();
    })
  });
}
