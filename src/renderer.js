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
const assetsBasePath = './src/assets';
const outputBasePath = './public';
const templateGlob = `${templateBasePath}/**/*.ejs`;
const assetsGlob = `${assetsBasePath}/**/*`;

function updateTemplatesList() {
  return glob.sync(templateGlob, {}).filter((template) => {
    return !isPartial(template);
  });
}

function updateAssetsList() {
  return glob.sync(assetsGlob, {});
}

function isPartial(pathName) {
  return path.basename(pathName).match(/^_/);
}

function outputPath(path) {
  let outputFileName = path.replace('.ejs', '.html');
  return outputFileName.replace(templateBasePath, outputBasePath);
}

function assetOutputPath(path) {
  // let outputFileName = path.replace('.ejs', '.html');
  return path.replace(assetsBasePath, `${outputBasePath}/assets`);
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

function prepareAsset(asset) {
  const output = assetOutputPath(asset);
  fs.ensureDir(path.dirname(output))
    .then(() => {
      fs.copyFile(asset, output);
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

function handleWatchedAssetPath(path) {
  Logger.info(`${path} changed! Preparing this asset.`);
  prepareAsset(`./${path}`);
}

function deleteWatchedAssetPath(path) {
  const output = assetOutputPath(`./${path}`);
  fs.unlink(output, (err) => {
    if (err) {
      return Logger.error('File could not be removed', err);
    }

    console.info(`${output} file was removed`);
  })
}

// Render all templates
function renderAllTemplates() {
  const templates = updateTemplatesList();

  Logger.debug('Rendering all templates', templates);
  templates.forEach((template) => {
    renderTemplate(template);
  });
}

// Prepare all assets
function prepareAllAssets() {
  Logger.debug('foo')
  const assets = updateAssetsList();

  Logger.debug('Preparing all assets', assets);
  assets.forEach((asset) => {
    prepareAsset(asset);
  });
}

// Setup Logger
Logger.useDefaults();
Logger.info('App initialized');

// Render all templates initially
renderAllTemplates();

// Prepare all assets initially
prepareAllAssets();

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
  });

  const assetWatcher  = chokidar.watch(assetsGlob, {
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../, // ignore dotfiles,
    persistent: true
  });

  assetWatcher.on('change', (path, stats) => {
    handleWatchedAssetPath(path);
  });

  assetWatcher.on('add', (path, stats) => {
    handleWatchedAssetPath(path);
  });

  assetWatcher.on('unlink', (path) => {
    deleteWatchedAssetPath(path)
  });
}
