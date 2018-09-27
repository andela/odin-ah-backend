import express from 'express';
import bodyParser from 'body-parser';
import YAML from 'yamljs';
import session from 'express-session';
import cors from 'cors';
import morgan from 'morgan';
import methodOverride from 'method-override';
import swaggerUi from 'swagger-ui-express';
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

app.use(
  session({
    secret: 'authorshaven',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);

app.use(routes);

// / catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  });
});

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${server.address().port}`);
});
export default server;
