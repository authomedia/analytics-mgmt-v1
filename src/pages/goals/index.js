import Page from '../page';
import events from '../../config/events';
import GoalsFormControl from '../../components/forms/goals-form-control';

class GoalsPage extends Page {
  constructor() {
    super();
    this.formControl = new GoalsFormControl();
  }

  init() {
    super.init();
    this.formControl.init();
    this.formControl.accounts.init();
  }
}

export default () => {
  $(function() {
    const page = new GoalsPage();

    $(window).on(events.GOOGLE.AUTHORIZED, function() {
      page.init();
    })
  });
}
