import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import config from '../config/config';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const configEnv = config[env];

const db = {};

const sequelize = new Sequelize(configEnv.url, { dialect: 'postgres' });

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
