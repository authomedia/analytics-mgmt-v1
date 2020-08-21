const Logger = require('js-logger');
const ejs = require('ejs');
const fs =  require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const pretty = require('pretty');
const glob = require('glob');

const production = !process.env.ROLLUP_WATCH;

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
const templateGlob = `${templateBasePath}/**/*.ejs`

function updateTemplatesList() {
  return glob.sync(templateGlob, {}).filter((template) => {
    return !isPartial(template);
  });
}

function isPartial(pathName) {
  return path.basename(pathName).match(/^_/);
}

function outputPath(path) {
  let outputFileName = path.replace('.ejs', '.html');
  return outputFileName.replace(templateBasePath, outputBasePath);
}

function renderTemplate(template) {
  // Render templates
  const output = outputPath(template);

  ejs.renderFile(template, ejsData, ejsOptions, function(err, str) {
    if (err) {
      return Logger.error('Template could not be rendered', err);
    }

    const dir = path.dirname(output);
    fs.ensureDir(dir)
      .then(() => {
        fs.writeFile(output, pretty(str, {ocd: true}), function (err) {
          if (err) {
            return Logger.error('Template could not be saved', err);
          }
          Logger.info(`${template} rendered as ${output}`);
        });
      })
      .catch((err) => {
        Logger.error(err);
      });
  });
}

function handleWatchedPath(path) {
  if (isPartial(path)) {
    Logger.info('Partial changed! Need to re-render all templates.');
    return renderAllTemplates();
  }

  Logger.info(`${path} changed! Re-rendering this template.`);
  renderTemplate(`./${path}`);
}

function deleteWatchedPath(path) {
  const output = outputPath(`./${path}`);
  fs.unlink(output, (err) => {
    if (err) {
      return Logger.error('File could not be removed', err);
    }

    console.info(`${output} file was removed`);
  })
}

// Render all templates
function renderAllTemplates() {
  templates = updateTemplatesList();

  Logger.debug('Rendering all templates', templates);
  templates.forEach((template) => {
    renderTemplate(template);
  });
}

// Setup Logger
Logger.useDefaults();
Logger.info('App initialized');

// Render all templates initially
renderAllTemplates();

// Watch for changes in nonproduction
if (!production) {
  const watcher = chokidar.watch(templateGlob, {
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../, // ignore dotfiles,
    persistent: true
  });

  watcher.on('change', (path, stats) => {
    handleWatchedPath(path);
  });

  watcher.on('add', (path, stats) => {
    handleWatchedPath(path);
  });

  watcher.on('unlink', (path) => {
    deleteWatchedPath(path)
  })
}
