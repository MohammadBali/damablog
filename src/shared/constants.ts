import dotenv from 'dotenv';
dotenv.config();

/**
 ** Sign Key Value
 ** Retrieved From environment file
 **/
const SignKey = process.env.SIGN_KEY || '?';

/** Pagination Defaults **/
const pageDefault=1;
const limitDefault=6;

export default {SignKey, pageDefault, limitDefault};