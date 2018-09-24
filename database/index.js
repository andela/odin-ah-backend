import config from '../config';
import Sequelize from 'sequelize';

const env = process.env.NODE_ENV || 'development';
// Or you can simply use a connection uri
const sequelize = new Sequelize(config.db[env]);

export default sequelize;