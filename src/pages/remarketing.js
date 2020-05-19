import Logger from 'js-logger';
import FormControl from '../components/forms/form-control';
import events from '../config/events';

export default () => {
  $(function() {
    const formControl = new FormControl();

    $(window).on(events.GOOGLE.AUTHORIZED, function() {
      formControl.audienceType.init();
      formControl.initRemarketingForm();
      formControl.accounts.init();
    });
  });
}
