import mongoose, {Schema} from "mongoose";

/**
 * Blog is a written blog in the system
 * @member _id ObjectID, the ID of this blog
 * @member author any, Type is any because it may be just his ID or a populated field
 * @member title string, The Title of this Blog
 * @member description string, The description on this Blog
 * @member createdAt any, The Date of this blog creation
 * @member updatedAt any, The last date when this blog was updated
 * **/
export interface Blog extends Document
{
    _id: Schema.Types.ObjectId;
    title: string;

    description: string;
    author: any;

    createdAt:any,
    updatedAt:any,
}

/**
 * @member currentPage The Current Page in Pagination
 * @member totalPages The Total Available Pages
 * @member nextPage the Next page to call
 * @member prevPage the previous page to call
 * **/
interface Pagination {
    currentPage: number;
    totalPages: number;
    nextPage?: string;
    prevPage?: string;
}

const blogSchema: Schema = new Schema({
    title:
        {
            type:String,
            required:true,
            trim:true,
        },

    description:
        {
            type:String,
            required:true,
            trim:true,
        },


    author:
        {
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
},{timestamps:true});

//Calculate the Pagination and return the data
blogSchema.statics.paginationCalculator= async function ({page,limit, filter={}}:{page:number; limit:number; filter?:Record<string,any>;}):Promise<Pagination>
{
    // Count the total number of orders
    const totalCount = await this.countDocuments(filter);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / limit);


    // Build the pagination object
    const pagination: Pagination = {
        currentPage: page,
        totalPages,
    };

    if (page < totalPages) {
        pagination.nextPage = `?page=${page + 1}&limit=${limit}`;
    }

    if (page > 1) {
        pagination.prevPage = `?page=${page - 1}&limit=${limit}`;
    }

    return pagination;
}

export const Blog = mongoose.model<Blog>('Blog',blogSchema);
