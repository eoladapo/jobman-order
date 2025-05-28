import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@eoladapo/jobman-shared';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import { checkConnection } from '@order/elasticsearch';
import { appRoutes } from '@order/routes';
import { config } from '@order/config';
import { Logger } from 'winston';
import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import http from 'http';
import { createConnection } from '@order/queues/connection';
import { Channel } from 'amqplib';
import { Server } from 'socket.io';
import { consumerReviewFanoutMessages } from './queues/order.consumer';

const SERVER_PORT = 4006;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderServer', 'debug');
let orderChannel: Channel;
let socketIOOrderObject: Server;

const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  orderErrorHandler(app);
  startServer(app);
};

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  ),
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const payload: IAuthPayload = verify(token, `${config.JWT_TOKEN}`) as IAuthPayload;
        req.currentUser = payload;
      }
      next();
    });
};

const standardMiddleware = (app: Application) => {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
};

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
};

const startQueues = async (): Promise<void> => {
  orderChannel = (await createConnection()) as Channel;
  await consumerReviewFanoutMessages(orderChannel);
};

const startElasticSearch = (): void => {
  checkConnection();
};

const orderErrorHandler = (app: Application): void => {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `OrderService ${error.comingFrom}: `, error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
};

const startServer = async (app: Application): Promise<void> => {
  try {
    const httpServer: http.Server = new http.Server(app);
    const socketIo: Server = await createSocketIO(httpServer);
    startHttpServer(httpServer);
    socketIOOrderObject = socketIo;
  } catch (error) {
    log.log('error', 'Order Service startServer() method:', error);
  }
};

const createSocketIO = async (httpServer: http.Server): Promise<Server> => {
  const io: Server = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  });
  return io;
};

const startHttpServer = (httpServer: http.Server): void => {
  try {
    log.info(`Order Server with process id ${process.pid} has started!`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Order Server is listening on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'Order Service startHttpServer() method:', error);
  }
};

export { start, orderChannel, socketIOOrderObject };
