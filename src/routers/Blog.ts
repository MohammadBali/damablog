import express, {Request, Response} from 'express';
import {Blog} from "../models/Blog";
import auth, {CustomRequest} from "../middleware/auth";
import constants from "../shared/constants";

const router = express.Router();

//Get All Blogs
/**
 * @swagger
 * /blog/blogs:
 *   get:
 *     summary: Retrieve all blogs with pagination.
 *     tags:
 *       - Blog
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page number for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: The number of blogs per page.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: A list of blogs with pagination information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       author:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     nextPage:
 *                       type: string
 *                     prevPage:
 *                       type: string
 *       500:
 *         description: Server error while fetching blogs.
 */
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
/**
 * @swagger
 * /blog/blogs:
 *   post:
 *     summary: Create a new blog.
 *     tags:
 *       - Blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My First Blog"
 *               description:
 *                 type: string
 *                 example: "This is the content of my first blog."
 *     responses:
 *       201:
 *         description: Blog successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 author:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Blog could not be created.
 *       500:
 *         description: Server error while adding the blog.
 */

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
/**
 * @swagger
 * /blog/blogs/{id}:
 *   put:
 *     summary: Update an existing blog.
 *     tags:
 *       - Blog
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the blog to update.
 *         required: true
 *         schema:
 *           type: string
 *           example: "60c72b2f5f1b2c3e5f3d5c0b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Blog Title"
 *               description:
 *                 type: string
 *                 example: "Updated description for the blog."
 *     responses:
 *       200:
 *         description: Blog successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 author:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid fields for update or missing id.
 *       404:
 *         description: Blog not found or not owned by the user.
 *       500:
 *         description: Server error while updating the blog.
 */
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
/**
 * @swagger
 * /blog/blogs/{id}:
 *   delete:
 *     summary: Delete a blog.
 *     tags:
 *       - Blog
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the blog to delete.
 *         required: true
 *         schema:
 *           type: string
 *           example: "60c72b2f5f1b2c3e5f3d5c0b"
 *     responses:
 *       200:
 *         description: Blog successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 author:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Blog not found.
 *       500:
 *         description: Server error while deleting the blog.
 */
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