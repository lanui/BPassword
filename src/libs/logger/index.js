import * as log from 'loglevel';
import { LOG_LEVEL } from './env-settings';

const logger = log.noConflict();

logger.setDefaultLevel(LOG_LEVEL);
logger.setLevel(LOG_LEVEL);

export default logger;
