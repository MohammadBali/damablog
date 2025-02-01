import {User} from "../models/User";
import {Request} from 'express';
import {BadRequestError} from "../shared/helper/errors";

class UserService
{
    /**
     * Signup a new user
     * @param req Express Request
     * **/
    static async signup(req:Request)
    {
        const user = new User(req.body);

        await user.save();

        //If User Couldn't be created
        if(!user)
        {
            throw new BadRequestError("User could not be created!");
        }

        //Generate a Token for this User and send it
        // @ts-ignore
        const token = await user.generateAuthToken();

        return { user, token, success: 1 }; // Return data instead of sending a response
    };

    /**
     * Login a User
     * @param req Request
     * **/
    static async login(req:Request)
    {
        if(!req.body.email || !req.body.password)
        {
            throw new BadRequestError("Missing Email or Password Parameter");
        }

        //Check if this email and password matches a current user
        //@ts-ignore
        const user= await User.findByCredentials(req.body.email,req.body.password);

        //create a token
        const token= await user.generateAuthToken();

        return {user,token, success:1};
    }
}

export default UserService