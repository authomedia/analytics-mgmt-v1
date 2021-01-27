import Logger from 'js-logger';
import customLogger from './components/custom-logger';
import router from './pages/router';
import authorizer from './utilities/ga-authorizer';

// JQuery repeater plugin - extends $('elem').repeater()
import { } from 'jquery.repeater/jquery.repeater';

// Setup Logger
Logger.useDefaults();
Logger.setHandler(customLogger);
Logger.info('App initialized');

// Get the current page path
let path = document.location.pathname;

// Route to the appropriate function based on the path
router[path]();

$(function() {
  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();
});
