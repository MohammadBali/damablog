import express, {Request, Response} from 'express';
import {Blog} from "../models/Blog";
import auth, {CustomRequest} from "../middleware/auth";
import constants from "../shared/constants";

const router = express.Router();

//Get All Blogs
router.get('/blog/blogs', async (req: Request, res: Response):Promise<any> => {
    try
    {
        const page = parseInt(req.query.page as string) || constants.pageDefault; // Current page number
        const limit = parseInt(req.query.limit as string) || constants.limitDefault; // Number of posts per page

        // Calculate the skip value
        const skip = (page - 1) * limit;

        const blogs = await Blog.find({},null,{limit:limit, skip:skip, sort:{createdAt:-1}}).populate('author');

        //Calculate the pagination and return it in a Map.
        //@ts-ignore
        const pagination= await Blog.paginationCalculator({page:page, limit:limit});

        return res.status(200).send({blogs:blogs, pagination:pagination});
    }
    catch (e:any)
    {
        return res.status(500).send({error:'Error While getting all blogs...', message:e.message});
    }
});

//Add a new Blog
router.post('/blog/blogs', auth.userAuth ,async(req: CustomRequest, res:Response):Promise<any>=>{

    try
    {
        req.body.author = req.user!._id;
        const blog = new Blog(req.body);

        await blog.save();

        if(!blog)
        {
            return res.status(400).send({error:'Blog could not be created'});
        }

        await blog.populate('author');

        return res.status(201).send(blog);
    }
    catch (e:any)
    {
        return res.status(500).send({error:'Error While adding your blog', message:e.message});
    }
});

//Patch a Blog
router.put('/blog/blogs/:id', auth.userAuth, async(req:CustomRequest, res:Response):Promise<any>=>{

    try
    {
        if(!req.params.id)
        {
            return res.status(400).send({error:'Error While updating your blog', message:'Missing Id Parameter'});
        }

        let blog = await Blog.findOne({_id:req.params.id, author:req.user!._id});

        if(!blog)
        {
            return res.status(404).send({error:'Error While Updating your blog', message:'No Such Blog exists!'});
        }

        // Allow only title and description fields to be changed
        const updates: Partial<Blog> = {};
        if (req.body.title) updates.title = req.body.title;
        if (req.body.description) updates.description = req.body.description;

        if (Object.keys(updates).length === 0) {
            return res.status(400).send({
                error: 'Error While Updating Your Blog',
                message: 'No valid fields provided for update.',
            });
        }

        const updatedBlog = await Blog.findOneAndUpdate({_id:req.params.id}, updates, {new:true}).populate('author');

        return res.status(200).send(updatedBlog);
    }
    catch(e:any)
    {
        return res.status(500).send({error:'Error While Updating your blog', message:e.message});
    }
});

//Delete a Blog
router.delete('/blog/blogs/:id', auth.managerAuth, async(req:Request, res:Response):Promise<any>=>{

    try
    {
        if(!req.params.id)
        {
            return res.status(400).send({error:'Error While deleting this blog', message:'Missing Id Parameter'});
        }

        const blog = await Blog.findOneAndDelete({_id:req.params.id});

        if(!blog)
        {
            return res.status(404).send({error:'Error While deleting your blog', message:'No Such Blog exists!'});
        }

        return res.status(200).send(blog);


    }
    catch (e:any)
    {
        return res.status(500).send({error:'Error while deleting a blog', message:e.message});
    }
});


export default router;