import commaNumber from 'comma-number';
import queue from '../utilities/queue';
import moment from 'moment';

import db from '../models/db';

class AdvertiserActivity {
  constructor() {
    this.cache = db.metricsCache;
    this.queue = queue;
  }

  async find(linkedViewId, accounts, type = 'adwords') {
    return new Promise(async (resolve, reject) => {
      let params = {};
      switch(type) {
        case 'adwords':
          params = {
            'ids': `ga:${linkedViewId}`,
            'start-date': '90daysAgo',
            'end-date': 'yesterday',
            'metrics': 'ga:sessions,ga:impressions,ga:adClicks,ga:adCost',
            'dimensions': 'ga:adwordsCustomerId',
            'filters': 'ga:sessions>100',
            'samplingLevel': 'HIGHER_PRECISION',
            'output': 'dataTable'
          }
          break;
        case 'dv360':
          params = {
            'ids': `ga:${linkedViewId}`,
            'start-date': '90daysAgo',
            'end-date': 'yesterday',
            'metrics': 'ga:sessions',
            'dimensions': 'ga:dbmClickAdvertiserId,ga:dbmClickAdvertiser',
            'samplingLevel': 'HIGHER_PRECISION',
            'output': 'dataTable'
          }
          break;
      }

      if (!linkedViewId) {
        console.log('No linked view supplied');
        return resolve(accounts);
      }

      const cacheData = await this.cache.get(linkedViewId).then((result) => {
        if (result) {
          result.dateTime = moment(result.timestamp).utc();
          return result;
        }
      });

      if (cacheData) {
        const cacheExpiryTime = moment().utc().subtract(1, 'days');
        if (cacheExpiryTime < cacheData.dateTime) {
          Object.assign(accounts, cacheData.data)
          return resolve(accounts);
        } else {
          this.cache.delete(linkedViewId.toString());
        }
      }

      return this.queue(() => {
        return gapi.client.analytics.data.ga.get(params).then((response) => {
          const results = response.result;

          if (results.totalResults === 0) {
            console.log(`No results for ga:${linkedViewId}`);
          } else {
            results.dataTable.rows.map((row) => {
              // const sessions = parseInt(row[1]);
              // const adClicks = parseInt(row[3]);
              // if (sessions > (adClicks * 0.8)) {
              // console.log(row[0], ': Ad Clicks count is within 20% of session count', sessions, adClicks * 0.8);
              // accounts[row[0]] = accounts[row[0]] || 0;
              // accounts[row[0]] = parseInt(row[1]);
              // }

              let advertiserId, advertiserName, sessions, impressions, adClicks;

              switch(type) {
                case 'adwords':
                  advertiserId = row.c[0].v;
                  advertiserName = row.c[0].v; // Can't get name for Adwords yet
                  sessions = row.c[1].v || 0;
                  impressions = row.c[2].v || 0;
                  adClicks = row.c[3].v || 0;
                  break;

                case 'dbm':
                  advertiserId = row.c[0].v;
                  advertiserName = row.c[1].v;
                  sessions = row.c[2].v || 0;
                  impressions = 0; // Can't get impressions for DBM yet!
                  adClicks = 0;  // Can't get ad clicks for DBM yet!
                  break;
              }

              const data = {
                name: advertiserName,
                sessions: parseInt(sessions),
                impressions: parseInt(impressions),
                adClicks: parseInt(adClicks)
              }

              accounts[advertiserId] = data;
            });
          }

          // Add to cache
          this.cache.put({
            index: linkedViewId,
            data: accounts,
            timestamp: moment().utc().toISOString()
          }).then((data) => {
            console.log('Addded data to cache', data);
          }).catch((error) => {
            console.log('Unable to add to cache', error);
          });

          return resolve(accounts);
        }).then(null, (error) => {
          return reject(error);
        });
      });
    });
  }
}


export default AdvertiserActivity;
