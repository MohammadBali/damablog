import mongoose, {Document, Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import constants from "../shared/constants";
import validator from "validator";

/**Interface of this entity
 * The User members
 * @member _id ObjectID, the ID of this User
 * @member name String, the name of this User
 * @member password String, hashed Password
 * @member token List<String>, contains every token of this user
 * @member createdAt any, The Date of this worker creation
 * @member updatedAt any, The last date when this user was updated
 * **/
export interface User extends Document
{
    _id: Schema.Types.ObjectId;
    name: String;

    password:String;
    token: [{token:string}];

    email:String;
    role:String;

    createdAt:any;
    updatedAt:any;

}

/**Define the User Schema in the DB**/
const userSchema: Schema = new Schema({

    name:{
        type: String,
        required:true,
        trim:true,
    },

    password:{
        type: String,
        trim:true,
        required:true,
        minlength:7,
        validate(value:any){
            if(value.toLowerCase().includes('password')) //The Password contains the word password
            {
                throw Error('Password format is not correct');
            }
        },
    },

    email:{
        type: String,
        required: true,
        unique:true,
        trim: true,
        lowercase:true,
        validate(value: any)
        {
            if(!validator.isEmail(value))
            {
                throw Error('The Email Provided is not a correct syntax.');
            }
        },
    },

    tokens:
        [
            {
                token:{
                    type:String,
                    required:true
                },
            }
        ],

    role:{
        type:String,
        required:true,
        default:'user',
        enum:['user','manager'],
    },

}, {timestamps:true});

//Telling Mongoose that the user is foreign key for the blog.
userSchema.virtual('user',{
    ref:'Blog',
    localField:'_id',
    foreignField:'author'
});

//Pre Saving The User; Hash his password then proceed
userSchema.pre('save', async function(next){
    const worker=this;

    if(worker.isModified('password')) //Check if the password is being changed => Hash it
    {
        console.log('in Pre User, Hashing Password...');
        worker.password= await bcrypt.hash(worker.password as string,8);
    }

    next();
});

//Static Method for each object of User type to check his credentials
userSchema.statics.findByCredentials= async (email,password)=>{

    const worker= await User.findOne({email});
    if(!worker)
    {
        throw Error('Unable to Login, No Such worker exists');
    }

    //Hash the password and compare it to the stored hash.
    const isMatch=await bcrypt.compare(password,worker.password as string);

    //Password is Wrong
    if(!isMatch)
    {
        throw Error('Wrong Credentials');
    }

    return worker;
}

//Generate Authorization Tokens
userSchema.methods.generateAuthToken= async function() {
    const user=this;
    const token= jwt.sign({_id: user._id.toString()}, constants.SignKey as string);

    //Adding Token to the worker's info.
    user.tokens=user.tokens.concat({token});

    await user.save();

    return token;
};

//Always Remove the password & tokens for security matters
userSchema.methods.toJSON= function()
{
    const worker=this;
    const workerObject= worker.toObject();

    delete workerObject.password;
    delete workerObject.tokens;

    return workerObject;
};

export const User = mongoose.model<User>('User', userSchema);