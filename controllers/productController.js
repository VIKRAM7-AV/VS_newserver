import Product from "../Models/productModel.js";
import Category from "../Models/categoryModel.js";
import cloudinary from "cloudinary";

export const addProduct = async (req, res) => {
    try {
        let { productName, productImg, UnitofMeasurement, category, description } = req.body;
        if (!productName || !category || !description) {
            return res.status(400).json({ message: "Please fill all the fields" })
        }
        const existingProduct = await Product.findOne({ productName });
        if (existingProduct) {
            return res.status(400).json({ message: "Product already exists" })
        }

        const uploadedImage = await cloudinary.uploader.upload(productImg);
        const productImgUrl = uploadedImage.secure_url;


        const existingCategory = await Category.findOne({ categoryName: category });
        if (!existingCategory) {
            return res.status(400).json({ message: "Category does not exist" })
        }


        const newproduct = new Product({
            productName,
            productImg: productImgUrl,
            UnitofMeasurement,
            description,
            category: existingCategory._id,
        })

        await newproduct.save();

        existingCategory.allproducts.push(newproduct._id);
        await existingCategory.save();

        res.status(200).json({ message: "Product added successfully", newproduct })


    } catch (error) {
        console.log("Error in addProduct controller", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const allproducts = async (req, res) => {
    try {
        const allProducts = await Product.find({}).sort({ createdAt: -1 });
        if (!allProducts) {
            return res.status(400).json({ message: "No products found" })
        }
        res.status(200).json({ message: "All products", allProducts })

    } catch (error) {
        console.log("Error in allproducts controller", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const singleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const singleProduct = await Product.findOne({ _id: id });
        if (!singleProduct) {
            return res.status(400).json({ message: "Product not found" })
        }
        res.status(200).json({ message: "Single product", singleProduct })

    } catch (error) {
        console.log("Error in singleProduct controller", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(400).json({ message: "Product not found" });
        }

        const categoryId = product.category?.[0];
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (category) {
                category.allproducts.pull(id);
                await category.save();
            }
        }
        await cloudinary.uploader.destroy(product.productImg.split('/').pop().split('.')[0]);

        await Product.findByIdAndDelete(id);

        res.status(200).json({ message: "Product deleted successfully", product });

    } catch (error) {
        console.log("Error in deleteProduct controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = await Product.findById(id);
    if (!productId) return res.status(400).json({ message: "Product not found" });

    let { productName, productImg, UnitofMeasurement, category, description } = req.body;

    if (!productName || !category || !description) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const existingProduct = await Product.findOne({ productName, _id: { $ne: id } });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const categoryname = await Category.findOne({ categoryName: category });
    if (!categoryname) {
      return res.status(400).json({ message: "Category does not exist" });
    }

    // Handle category reassignment
    if (categoryname._id.toString() !== productId.category.toString()) {
      const oldCategory = await Category.findById(productId.category);
      if (oldCategory) {
        oldCategory.allproducts.pull(productId._id);
        await oldCategory.save();
      }

      categoryname.allproducts.push(productId._id);
      await categoryname.save();
    }

    let updatedProductImg = productId.productImg;
    let updatedCloudinaryId = productId.cloudinaryId;

    if (productImg && productImg !== productId.productImg) {
      // Delete old image if exists
      if (productId.cloudinaryId) {
        await cloudinary.uploader.destroy(productId.cloudinaryId);
      }

      // Upload new image
      const uploaded = await cloudinary.uploader.upload(productImg);
      updatedProductImg = uploaded.secure_url;
      updatedCloudinaryId = uploaded.public_id;
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        productName,
        productImg: updatedProductImg,
        cloudinaryId: updatedCloudinaryId,
        UnitofMeasurement,
        description,
        category: categoryname._id,
      },
      { new: true }
    );

    res.status(200).json({ message: "Product updated successfully", updated });

  } catch (error) {
    console.error("Error in updateProduct controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

