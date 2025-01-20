import express from "express";
import jwt from "jsonwebtoken";
import constants from '../shared/constants';
import {User} from "../models/User";


export interface CustomRequest extends express.Request {
    user?: User
    token?: string
}

/**Authenticate The User
 * @param req the API's request; so we can extract the header and add fields if needed
 * @param res the API's response; usually if the authentication has failed then we delicate the return from here
 * @param next allow the API to continue into handling if the authentication is a success
 * @return Promise<void> ; no data is returned
 * **/
const userAuth=async(req:CustomRequest, res:express.Response, next: express.NextFunction) =>
{
    try
    {
        const token= req.header('Authorization')?.replace('Bearer ','');

        const data:any= jwt.verify(token as string ,constants.SignKey);

        const user= await User.findOne({_id:data._id, 'tokens.token':token }); //Find a worker with his ID and with this Token, if found => Authenticated

        if(!user)
        {
            throw new Error();
        }

        req.token=token;
        req.user=user;

        next();
    }

    catch(e:any)
    {
        res.status(401).send({error:'Not Authenticated', message:e.message});
    }
};

/**Authenticate if Manager
 * @param req the API's request; so we can extract the header and add fields if needed
 * @param res the API's response; usually if the authentication has failed then we delicate the return from here
 * @param next allow the API to continue into handling if the authentication is a success
 * @return Promise<void> ; no data is returned
 * **/
const managerAuth=async(req:CustomRequest, res:express.Response, next: express.NextFunction) =>
{
    try
    {
        const token= req.header('Authorization')?.replace('Bearer ','');

        const data:any= jwt.verify(token as string ,constants.SignKey);

        const user= await User.findOne({_id:data._id, 'tokens.token':token }); //Find a user with his ID and with this Token & check his role

        //if he's not a manager = refuse authentication
        if(!user || user.role !== 'manager')
        {
            throw new Error('Wrong Credentials');
        }

        req.token=token;
        req.user=user;

        next();
    }

    catch(e:any)
    {
        res.status(401).send({error:'Not Authenticated', message:e.message});
    }
};

export default {userAuth, managerAuth};