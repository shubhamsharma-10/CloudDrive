import { Router } from 'express';
import fileController from '../controllers/file.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const fileRouter = Router()

fileRouter.get('/shared/:token', fileController.getSharedFile);

fileRouter.use(authMiddleware)

fileRouter.get('/', fileController.getFile);
fileRouter.post('/upload', upload.single('file'), fileController.uploadFile);
fileRouter.get('/search', fileController.searchFiles);
fileRouter.put('/:id/rename', fileController.renameFile);
fileRouter.delete('/:id', fileController.deleteFile);
fileRouter.get('/:id/download', fileController.downloadFile);
fileRouter.post('/:id/share', fileController.enableSharing);
fileRouter.post('/:id/unshare', fileController.disableSharing);


export default fileRouter;