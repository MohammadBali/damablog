import express, {Request, Response} from 'express';
import {User} from "../models/User";
import UserService from "../services/User";
import {AppError} from "../shared/helper/errors";
const router = express.Router();

//Add a New User
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Add a new user.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 example: "securePass123"
 *     responses:
 *       201:
 *         description: User successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     weightLimit:
 *                       type: number
 *                     state:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: string
 *                 success:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: User could not be created.
 *       500:
 *         description: Server error while adding a user.
 */
router.post('/auth/signup', async (req:Request, res:Response):Promise<any> => {

    try
    {
        const result = await UserService.signup(req);
        return res.status(201).send(result);
    }

    catch (e:any)
    {
        if (e instanceof AppError)
        {
            return res.status(e.statusCode).send({ error: e.message });
        }
        return res.status(500).send({error:'Error While Adding A User...', message:e.message});
    }
});

//Login a User and send a token
/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user and retrieve an authentication token.
 *     description: Allows a user to log in by providing an email and password, returning an authentication token upon success.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: userpassword123
 *     responses:
 *       200:
 *         description: Successful login with user details and token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 603d2f30f1a4b9128c8e4b3a
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     weightLimit:
 *                       type: integer
 *                       example: 100
 *                     state:
 *                       type: string
 *                       example: resting
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 success:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Missing email or password parameter.
 *       500:
 *         description: Error while attempting to sign in.
 */
router.post('/auth/login', async (req:Request,res:Response):Promise<any>=>{

    try
    {
        const result = await UserService.login(req);

        return res.status(201).send(result);
    }

    catch (e:any)
    {
        if (e instanceof AppError)
        {
            return res.status(e.statusCode).send({ error: e.message });
        }

        return res.status(500).send({error:'Could not sign you in', message:e.message});
    }
});

export default router;