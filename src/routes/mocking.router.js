import { Router } from "express";
import mockingController from '../controllers/mocking.controller.js';


const mockingRouter=Router()

mockingRouter.post('/generateData', mockingController.generateData);

mockingRouter.get('/mockingpets',mockingController.postMocksPets);

mockingRouter.get('/mockingusers', mockingController.postMocksUser);



export default mockingRouter;