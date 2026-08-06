import { Router } from 'express';
import {
  getBoardsController,
  getPortsController,
  compileController,
  uploadController,
  searchLibrariesController,
  installLibraryController,
  removeLibraryController,
  updateLibraryController,
} from '../controllers/arduinoController.js';

export const arduinoRouter = Router();

arduinoRouter.get('/boards', getBoardsController);
arduinoRouter.get('/ports', getPortsController);
arduinoRouter.post('/compile', compileController);
arduinoRouter.post('/upload', uploadController);

arduinoRouter.get('/libraries', searchLibrariesController);
arduinoRouter.post('/libraries/install', installLibraryController);
arduinoRouter.post('/libraries/remove', removeLibraryController);
arduinoRouter.post('/libraries/update', updateLibraryController);
