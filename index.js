import express from 'express';
import bodyParser from 'body-parser';
import YAML from 'yamljs';
import cors from 'cors';
import morgan from 'morgan';
import methodOverride from 'method-override';
import swaggerUi from 'swagger-ui-express';
import passport from 'passport';
import session from 'express-session';
import routes from './routes';
import googleStrategy from './config/passport/google';
import facebookStrategy from './config/passport/facebook';
import twitterStrategy from './config/passport/twitter';

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

app.use(session({ secret: process.env.SESSION_SECRET }));

passport.use(googleStrategy);
passport.use(facebookStrategy);
passport.use(twitterStrategy);
app.use(passport.initialize());

app.use(routes);

export default app;

// j
