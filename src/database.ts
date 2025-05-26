import { winstonLogger } from '@eoladapo/jobman-shared';
import mongoose from 'mongoose';
import { Logger } from 'winston';
import { config } from '@order/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderDatabase', 'debug');

const databaseConnection = async () => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    log.info('Order Service - Successfully connected to database');
  } catch (error) {
    log.error('error', 'Order Service databaseConnection() method:', error);
  }
};

export { databaseConnection };
