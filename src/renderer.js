const Logger = require('js-logger');
const ejs = require('ejs');
const fs =  require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const pretty = require('pretty');

const production = !process.env.ROLLUP_WATCH;
// production = false;

// Setup Logger
Logger.useDefaults();
Logger.info('App initialized');

// Setup EJS options
const ejsData = {}
const ejsOptions = {
  root: './src/views',
  views: [
    './src/views',
    'src/views/shared'
  ]
}

const templateBasePath = './src/views';
const outputBasePath = './public';

const templates = [
  'index.ejs',
  'custom-dimensions/audit.ejs',
  'custom-dimensions/upload.ejs',
  'custom-metrics/audit.ejs',
  'custom-metrics/upload.ejs',
  'goals/audit.ejs',
  'profiles/audit.ejs'
]

function renderTemplate(template) {
  // Render templates
  let outputFileName = template.replace('.ejs', '.html');
  let outputFile = `${outputBasePath}/${outputFileName}`;
  let templateFile = `${templateBasePath}/${template}`

  ejs.renderFile(templateFile, ejsData, ejsOptions, function(err, str) {
    if (err) {
      return Logger.error('Template could not be rendered', err);
    }

    const dir = path.dirname(outputFile);
    fs.ensureDir(dir)
      .then(() => {
        fs.writeFile(outputFile, pretty(str, {ocd: true}), function (err) {
          if (err) {
            return Logger.error('Template could not be saved', err);
          }
          Logger.info(`${templateFile} rendered as ${outputFile}`);
        });
      })
      .catch((err) => {
        Logger.error(err);
      });
  });
}

function processWatchedPath(path) {
  // Remove base path prefix
  template = path.replace(templateBasePath.replace('./',''), '');

  // Remove / prefix
  template = template.replace('/', '');

  Logger.info(`${template} changed - re-rendering...`);
  renderTemplate(template);
}

function deleteWatchedPath(path) {
  Logger.warn('deleteWatchedPath is not defined yet!');
}

// Render all templates
templates.forEach((template) => {
  renderTemplate(template);
});

// Watch for changes in nonproduction
if (!production) {
  const watcher = chokidar.watch(`${templateBasePath}/**/*.ejs`, {
    ignoreInitial: true,
    ignored: [
      /(^|[\/\\])\../, // ignore dotfiles
      pathString => {
         // Ignore partials beginning _
        let dn = path.dirname(pathString);
        let ps = pathString.replace(dn,'');
        return ps.match(/^\/_/);
      }
    ],
    persistent: true
  });

  watcher.on('change', (path, stats) => {
    processWatchedPath(path);
  });

  watcher.on('add', (path, stats) => {
    processWatchedPath(path);
  });

  watcher.on('unlink', (path) => {
    deleteWatchedPath(path)
  })
}
