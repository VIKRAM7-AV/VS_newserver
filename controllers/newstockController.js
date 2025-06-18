import newStocksModel from "../Models/newStocksModel.js";
import Product from "../Models/productModel.js";

export const inboundStock = async (req, res) => {
    try {
        const projectId = req.project;
        const { id } = req.params;
        const product = await Product.findOne({ _id: id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const { values,description } = req.body;
        if (!values || !description) {
            return res.status(400).json({ message: "Values are required" });
        }
        const existingProject = await newStocksModel.findOne({ siteId: projectId });
        if (!existingProject) {
            const newProject = new newStocksModel({
                siteId: projectId,
                inbound: [{
                    materialId: id,
                    values: values,
                    description: description,
                    date: new Date()
                }]
            })
            await newProject.save();
            return res.status(201).json({ message: "New project created", data: newProject });
        }
        else {
            const existingInbound = existingProject.inbound.find(item => item.materialId.toString() === id);
            if (existingInbound) {
                existingInbound.values.push(values);
                existingInbound.description = push(description);
                existingInbound.date.push(new Date());
                await existingProject.save();
                return res.status(200).json({ message: "Inbound stock updated", existingProject });
            }
            else {
                existingProject.inbound.push({
                    materialId: id,
                    values: values,
                    description: description,
                    date: new Date()
                });
                await existingProject.save();
                return res.status(200).json({ message: "New inbound stock added", existingProject });
            }
        }
    } catch (error) {
        console.log("Error in inboundStock: ", error);
        res.status(500).json({ message: "Internal server error" });
    }

}


export const outboundStock = async (req, res) => {
    try {
        const projectId = req.project;
        const { id } = req.params;
        const product = await Product.findOne({ _id: id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const { values, location,description } = req.body;
        if (!values || !location || !description) {
            return res.status(400).json({ message: "Values are required" });
        }
        const existingProject = await newStocksModel.findOne({ siteId: projectId });
        if (!existingProject) {
            const newProject = new newStocksModel({
                siteId: projectId,
                outbound: [{
                    materialId: id,
                    values: values,
                    description: description,
                    location: location,
                    date: new Date()
                }]
            })
            await newProject.save();
            return res.status(201).json({ message: "New project created", data: newProject });
        }
        else {
            const existingInbound = existingProject.outbound.find(item => item.materialId.toString() === id);
            if (existingInbound) {
                existingInbound.values.push(values);
                existingInbound.location.push(location);
                existingInbound.description = push(description);
                existingInbound.date.push(new Date());
                await existingProject.save();
                return res.status(200).json({ message: "Outbound stock updated", existingProject });
            }
            else {
                existingProject.outbound.push({
                    materialId: id,
                    values: values,
                    description: description,
                    location: location,
                    date: new Date()
                });
                await existingProject.save();
                return res.status(200).json({ message: "New outbound stock added", existingProject });
            }
        }
    } catch (error) {
        console.log("Error in OutboundStock: ", error);
        res.status(500).json({ message: "Internal server error" });
    }

}


export const getallStock = async (req, res) => {
    try {
        const stockData = await newStocksModel.find({}).sort({ createdAt: -1 }).populate('siteId')
            .populate({
                path: 'inbound.materialId',
                populate: { path: 'category' }
            })
            .populate({
                path: 'outbound.materialId',
                populate: { path: 'category' }
            });

        if (stockData.length === 0) {
            return res.status(404).json({ message: "No stock data found" });
        }

        res.status(200).json({ message: "Stock data retrieved successfully", stockData });


    } catch (error) {
        console.log("Error in inboundStockById: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}