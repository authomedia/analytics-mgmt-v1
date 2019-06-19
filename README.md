# Analytics Management Tool v1

This project aims to provide a unified management interface for Google Analytics, for applying behaviour simultaneously across multiple Accounts.

## Getting started

Clone this repository and install its dependencies:

```bash
git clone https://github.com/authomedia/analytics-mgmt-v1.git
cd analytics-mgmt-v1
npm install
```

### Add your Google API Client ID

* Copy the `.env.example` file to `.env`
* Add your `CLIENT_ID` as generated in the [Google API Console](https://console.developers.google.com/flows/enableapi?apiid=analytics&credential=client_key)

## Building and running

`npm run build` builds the application to `public/bundle.js`, along with a sourcemap file for debugging.

`npm start` launches a server, using [serve](https://github.com/zeit/serve). Navigate to [localhost:5000](http://localhost:5000).

`npm run watch` will continually rebuild the application as your source files change.

`npm run dev` will run `npm start` and `npm run watch` in parallel.

### Developing

The `public/index.html` file contains a `<script src='/js/bundle.js'>` tag, which means we need to create `public/js/bundle.js`. The `rollup.config.js` file tells Rollup how to create this bundle, starting with `src/main.js` and including all its dependencies.

## License

&copy; 2019 Analyt Ltd.


### Contributors

* [Joey Connor](https://gitlab.com/authomedia)
