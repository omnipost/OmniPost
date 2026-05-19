// src/workers/startWorkers.ts
// Start all Bull queue workers — import in server.ts or run as separate process

import 'dotenv/config';
import './publishWorker';
import { logger } from '../config/logger';

logger.info('🔧 All OmniPost workers started');
