import Logger from 'js-logger';
import customLogger from './components/custom-logger';
import router from './pages/router';
import authorizer from './utilities/ga-authorizer';

// Setup Logger
Logger.useDefaults();
Logger.setHandler(customLogger);
Logger.info('App initialized');

// Get the current page path
let path = document.location.pathname;

// Route to the appropriate function based on the path
router[path]();
