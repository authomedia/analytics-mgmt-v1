import Dexie from 'dexie';

import constants from '../config/constants';

const db = new Dexie(process.env.DB_NAME);
const dbFields = constants.DB_FIELDS.join(', ');

db.version(1).stores({
  customDimensions: dbFields
});

export default db;
