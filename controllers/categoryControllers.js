import Category from "../Models/categoryModel.js";
import cloudinary from "cloudinary";

export const addCategory=async(req,res) => {
    try {
        let {categoryName, description, categoryImg} = req.body;
        if (!categoryName || !description) {
            return res.status(400).json({error:"Please fill all the fields"});
        }
        const existingcategory=await Category.findOne({categoryName});
        if(existingcategory){
            return res.status(400).json({error:"Category already exists"});
        }

        const categoryImgUrl= await cloudinary.uploader.upload(categoryImg);
        categoryImg=categoryImgUrl.secure_url;

        const category= new Category({
            categoryName,
            description,
            categoryImg
        })

        await category.save();
        res.status(200).json({message:"Category added successfully",category});
        
    } catch (error) {
        console.log("Error in addCategory controller",error);
        res.status(500).json({error:"Internal server error in addCategory"});
    }
}

export const getAllCategories=async(req,res) => {
    try {
        const categories=await Category.find({})
        if(!categories){
            return res.status(404).json({error:"No categories found"});
        }
        res.status(200).json({message:"Categories fetched successfully",categories});
        
    } catch (error) {
        console.log("Error in getAllCategories controller",error);
        res.status(500).json({error:"Internal server error in getAllCategories"});
    }
}

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Category id is required" });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        // If there's an image, delete from Cloudinary
        if (category.categoryImg) {
            const publicId = category.categoryImg.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        // Delete the category after Cloudinary deletion
        await Category.findByIdAndDelete(id);

        res.status(200).json({ message: "Category deleted successfully", category });

    } catch (error) {
        console.log("Error in deleteCategory controller", error);
        res.status(500).json({ error: "Internal server error in deleteCategory" });
    }
}


export const singleCategory=async(req,res) => {
    try {
        const {id}=req.params;
        if(!id){
            return res.status(400).json({error:"Category id is required"});
        }
        const category=await Category.findById({_id:id});
        if(!category){
            return res.status(404).json({error:"Category not found"});
        }
        res.status(200).json({message:"Category fetched successfully",category});
        
    } catch (error) {
        console.log("Error in singleCategory controller",error);
        res.status(500).json({error:"Internal server error in singleCategory"});
    }
}