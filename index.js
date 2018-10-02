import express from 'express';
import bodyParser from 'body-parser';
import YAML from 'yamljs';
import cors from 'cors';
import morgan from 'morgan';
import methodOverride from 'method-override';
import swaggerUi from 'swagger-ui-express';
import logger from './helpers/logger';
import routes from './routes';

const swaggerDocument = YAML.load('./swagger.yaml');

// Create global app object
const app = express();

app.use(cors());

// Swagger api documentaion
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Normal express config defaults
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride());
app.use(express.static(`${__dirname}/public`));


app.use(routes);

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, () => {
  logger.info(`Listening on port ${server.address().port}`);
});
export default server;
