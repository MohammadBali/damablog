import {Blog} from "../models/Blog";
import {Request} from 'express';
import constants from "../shared/constants";
import {CustomRequest} from "../middleware/auth";
import {BadRequestError, NotFoundError} from "../shared/helper/errors";

class BlogService
{
    /**
     * Get All Blogs
     * @param req Request
     * **/
    static async getAllBlogs(req:Request)
    {
        const page = parseInt(req.query.page as string) || constants.pageDefault; // Current page number
        const limit = parseInt(req.query.limit as string) || constants.limitDefault; // Number of posts per page

        // Calculate the skip value
        const skip = (page - 1) * limit;

        const blogs = await Blog.find({},null,{limit:limit, skip:skip, sort:{createdAt:-1}}).populate('author');

        //Calculate the pagination and return it in a Map.
        //@ts-ignore
        const pagination= await Blog.paginationCalculator({page:page, limit:limit});

        return {blogs:blogs, pagination:pagination};
    }

    /**
     * Add a New Blog
     * @param req CustomRequest (With User data passed)
     * **/
    static async addNewBlog(req:CustomRequest)
    {
        req.body.author = req.user!._id;
        const blog = new Blog(req.body);

        await blog.save();

        if(!blog)
        {
            throw new BadRequestError('Blog could not be created');
        }

        await blog.populate('author');

        return blog;
    }

    /**
     * Patch a Blog
     * @param req CustomRequest (With User data passed)
     * **/
    static async patchBlog(req:CustomRequest)
    {
        if(!req.params.id)
        {
            throw new BadRequestError("Missing Id Parameter");
        }

        let blog = await Blog.findOne({_id:req.params.id, author:req.user!._id});

        if(!blog)
        {
            throw new NotFoundError("No Such Blog exists!");
        }

        // Allow only title and description fields to be changed
        const updates: Partial<Blog> = {};
        if (req.body.title) updates.title = req.body.title;
        if (req.body.description) updates.description = req.body.description;

        if (Object.keys(updates).length === 0)
        {
            throw new BadRequestError('No valid fields provided for update.');
        }

        return Blog.findOneAndUpdate({_id: req.params.id}, updates, {new: true}).populate('author');
    }

    /**
     * Delete a Blog
     * @param req Request
     * **/
    static async deleteBlog(req:Request)
    {
        if(!req.params.id)
        {
            throw new BadRequestError("Missing Id Parameter");
        }

        const blog = await Blog.findOneAndDelete({_id:req.params.id});

        if(!blog)
        {
            throw new NotFoundError('No Such Blog exists!');
        }

        return blog;

    }
}

export default BlogService;