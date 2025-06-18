import Project from "../Models/projectModel.js";
import Product from "../Models/productModel.js";
import StackData from "../Models/stockModel.js";

export const inboundEntry = async (req, res) => {
  try {
    const { id } = req.params; // Material ID
    const { inbound, description } = req.body;

    if (typeof inbound !== "number" || !description) {
      return res.status(400).json({ message: "Inbound and description are required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const projectId = req.project;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const stackData = await StackData.findOne({ siteId: projectId });

    if (!stackData) {
      // No stock record exists yet, create new
      const newStock = inbound;
      const values = 0;
      const outbound = 0;

      const newStackData = new StackData({
        siteId: projectId,
        type: [{
          materialId: product._id,
          Stock: [newStock],
          values: [values],
          outbound: [outbound],
          inbound: [inbound],
          description: [description],
          date: [new Date()]
        }],
      });

      await newStackData.save();
      return res.status(201).json({ message: "Stock entry created", newStackData });
    }

    // Stock record exists
    const existingEntry = stackData.type.find(entry => entry.materialId.toString() === product._id.toString());

    if (existingEntry) {
      const lastStock = existingEntry.Stock.at(-1) ?? 0;
      const newStock = lastStock + inbound;

      existingEntry.Stock.push(newStock);
      existingEntry.inbound.push(inbound);
      existingEntry.values.push(0);
      existingEntry.outbound.push(0);
      existingEntry.description.push(description);
      existingEntry.date.push(new Date());
    } else {
      // No entry yet for this product
      const newStock = inbound;

      stackData.type.push({
        materialId: product._id,
        Stock: [newStock],
        values: [0],
        outbound: [0],
        inbound: [inbound],
        description: [description],
        date: [new Date()],
      });
    }

    await stackData.save();
    return res.status(200).json({ message: "Stock entry updated" });

  } catch (error) {
    console.log("❌ Error in inboundEntry:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const outboundEntry = async (req, res) => {
  try {
    const { id } = req.params; // Material ID
    const { outbound, description } = req.body;

    // Validate inputs
    if (typeof outbound !== "number" || !description) {
      return res.status(400).json({ message: "Outbound and description are required" });
    }

    // Validate product and project
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const projectId = req.project;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const stackData = await StackData.findOne({ siteId: projectId });

    if (!stackData) {
      return res.status(400).json({ message: "No existing stock data found to perform outbound." });
    }

    const existingEntry = stackData.type.find(
      entry => entry.materialId.toString() === product._id.toString()
    );

    if (!existingEntry) {
      return res.status(400).json({ message: "Material does not exist in stock for this site." });
    }

    // ✅ Outbound calculation
    const lastStock = existingEntry.Stock.at(-1) ?? 0;

    if (outbound > lastStock) {
      return res.status(400).json({ message: `Not enough stock. Available: ${lastStock}, Requested: ${outbound}` });
    }

    const newStock = lastStock - outbound;

    // 🔁 Push updated values
    existingEntry.Stock.push(newStock);
    existingEntry.inbound.push(0); // No inbound in outbound entry
    existingEntry.values.push(0); // Assuming values are not used in outbound
    existingEntry.outbound.push(outbound);
    existingEntry.description.push(description);
    existingEntry.date.push(new Date());

    await stackData.save();

    return res.status(200).json({ message: "Outbound entry updated successfully" });

  } catch (error) {
    console.log("❌ Error in outboundEntry:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const stockEntry = async (req, res) => {
  try {
    const { id } = req.params; // Material ID
    const { values, description } = req.body;

    // Validate inputs
    if (typeof values !== "number" || !description) {
      return res.status(400).json({ message: "Value and description are required" });
    }

    // Validate product and project
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const projectId = req.project;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const stackData = await StackData.findOne({ siteId: projectId });

    if (!stackData) {
      return res.status(400).json({ message: "No existing stock data found to perform outbound." });
    }

    const existingEntry = stackData.type.find(
      entry => entry.materialId.toString() === product._id.toString()
    );

    if (!existingEntry) {
      return res.status(400).json({ message: "Material does not exist in stock for this site." });
    }

    const lastStock = existingEntry.Stock.at(-1) ?? 0;

    if (values > lastStock) {
      return res.status(400).json({ message: `Not enough stock. Available: ${lastStock}, Requested: ${outbound}` });
    }

    const newStock = lastStock - values;
    existingEntry.Stock.push(newStock);
    existingEntry.inbound.push(0);
    existingEntry.values.push(values);
    existingEntry.outbound.push(0);
    existingEntry.description.push(description);
    existingEntry.date.push(new Date());

    await stackData.save();

    return res.status(200).json({ message: "Value entry updated successfully" });

  } catch (error) {
    console.log("❌ Error in outboundEntry:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getProductStack = async (req, res, next) => {
  try {
    const projectId = req.project;
    const stackData = await StackData.findOne({ siteId: projectId._id }).populate();

    if (!stackData) {
      return res.status(404).json({ message: "No stock data found for this project" });
    }
    res.status(200).json({ message: "Stock data retrieved successfully", stackData });

  } catch (error) {
    console.log("Error in getProductStack controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getProductSite = async (req, res) => {
  try {
    const projectId = req.params.id;
    const existingProject = await Project.findById({ _id: projectId });
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    const stackData = await StackData.findOne({ siteId: projectId }).populate();
    if (!stackData) {
      return res.status(404).json({ message: "No stock data found for this project" });
    }
    res.status(200).json({ message: "Stock data retrieved successfully", stackData });
  } catch (error) {
    console.log("Error in getProductStack controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const AllProduct = async (req, res) => {
  try {
    const allStock = await StackData.find({}).populate({
      path: 'type.materialId',
      populate: { path: 'category' }
    });
    if (!allStock || allStock.length === 0) {
      return res.status(404).json({ message: "No stock data found" });
    }
    res.status(200).json({ message: "Stock data retrieved successfully", allStock });
  } catch (error) {
    console.log("Error in getProductStack controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const lastentry = async (req, res) => {
  try {
    const projectId = req.project;
    const stackData = await StackData.findOne({ siteId: projectId._id }).populate('type.materialId');

    if (!stackData) {
      return res.status(404).json({ message: "No stock data found for this project" });
    }
    if (stackData.type.length === 0) {
      return res.status(404).json({ message: "No stock entries found" });
    }

    const lastEntry = stackData.type.map(entry => ({
      materialId: entry.materialId.productName,
      lastValue: entry.values[entry.values.length - 1],
      lastDate: entry.date[entry.date.length - 1]
    }));
    res.status(200).json({ message: "Last stock entry retrieved successfully", lastEntry });

  } catch (error) {
    console.log("Error in lastentry controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const singleProduct = async (req, res) => {
  try {
    const typeId = req.params.id;

    const doc = await StackData.findOne({ "type._id": typeId }).populate("type.materialId");

    if (!doc) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Step 2: Find the specific type entry from the array
    const selectedType = doc.type.find(t => String(t._id) === typeId);

    if (!selectedType) {
      return res.status(404).json({ message: "Material type not found in array." });
    }

    const material = selectedType.materialId;

    // Step 3: Sort by date (descending)
    const combined = selectedType.date.map((d, i) => ({
      date: new Date(d),
      description: selectedType.description[i],
      value: selectedType.values[i],
      Stock: selectedType.Stock[i],
      inbound: selectedType.inbound[i],
      outbound: selectedType.outbound[i]
    }));

    // Sort by date descending
    const sorted = combined.sort((a, b) => b.date - a.date);

    // Separate sorted values and dates
    const sortedValues = sorted.map(entry => entry.value);
    const sortedDescription = sorted.map(entry => entry.description);
    const sortedInbound = sorted.map(entry => entry.inbound);
    const sortedOutbound = sorted.map(entry => entry.outbound);
    const sortedStock = sorted.map(entry => entry.Stock);
    const sortedDates = sorted.map(entry => entry.date);

    // Step 4: Format the response
    const result = {
      material: {
        productName: material?.productName || "N/A",
        UnitofMeasurement: material?.UnitofMeasurement || "N/A",
        category: material?.category || [],
      },
      description: sortedDescription,
      date: sortedDates,
      values: sortedValues,
      inbound: sortedInbound,
      Stock: sortedStock,
      outbound: sortedOutbound,
    };
    return res.status(200).json(result);

  } catch (error) {
    console.error("❌ Error in singleProduct:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateStockHistory = async (req, res) => {
  try {
    const { id, index } = req.params; // id = type._id, index = target index
    let { inbound, value } = req.body;

    const idx = parseInt(index);
    if (isNaN(idx)) {
      return res.status(400).json({ message: "Invalid index", details: { index } });
    }

    // Convert to numbers only if defined
    inbound = inbound !== undefined ? Number(inbound) : undefined;
    value = value !== undefined ? Number(value) : undefined;

    // 🔧 Load entire document first — DO NOT filter inside the nested array!
    const stockData = await StackData.findOne({ "type._id": id });
    if (!stockData) {
      return res.status(404).json({ message: "Stock data not found", details: { id } });
    }

    // ✅ Safely find the correct `type` entry
    const entry = stockData.type.find((t) => t._id.toString() === id);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found in type[]", details: { id } });
    }

    if (idx < 0 || idx >= entry.date.length) {
      return res.status(400).json({
        message: "Index out of bounds",
        details: { index: idx, dateLength: entry.date.length },
      });
    }

    // Fix array lengths if inconsistent
    if (
      entry.Stock.length !== entry.date.length ||
      entry.values.length !== entry.date.length ||
      !entry.inbound ||
      entry.inbound.length !== entry.date.length
    ) {
      entry.inbound = new Array(entry.date.length).fill(0);
      entry.Stock = new Array(entry.date.length).fill(0);
      entry.values = new Array(entry.date.length).fill(0);
      console.warn("Arrays were re-initialized due to inconsistent lengths", { id });
    }

    // Validate inbound/value
    if (inbound !== undefined) {
      if (isNaN(inbound) || inbound < 0) {
        return res.status(400).json({ message: "Invalid inbound", details: { inbound } });
      }
      entry.inbound[idx] = inbound;
    }

    if (value !== undefined) {
      if (isNaN(value) || value < 0) {
        return res.status(400).json({ message: "Invalid value", details: { value } });
      }
      entry.values[idx] = value;
    }

    // ✅ Recalculate Stock values from current index onward
    for (let i = idx; i < entry.date.length; i++) {
      const prevStock = i === 0 ? 0 : entry.Stock[i - 1];
      const inboundVal = Number(entry.inbound[i]) || 0;
      const valueVal = Number(entry.values[i]) || 0;
      const newStock = prevStock + inboundVal - valueVal;

      if (isNaN(newStock) || newStock < 0) {
        return res.status(400).json({
          message: "Invalid stock calculation",
          details: { index: i, prevStock, inboundVal, valueVal, newStock },
        });
      }

      entry.Stock[i] = newStock;
    }

    // Save document
    await stockData.save();

    return res.status(200).json({
      message: "Stock updated successfully",
      updatedIndex: idx,
      updatedInbound: entry.inbound[idx],
      updatedValue: entry.values[idx],
      updatedStock: entry.Stock[idx],
    });
  } catch (err) {
    console.error("❌ Error updating stock history:", err);
    return res.status(500).json({
      message: "Server error while updating stock",
      error: err.message,
    });
  }
};

export const stockproducts = async (req, res) => {
  try {
    const projectId = req.params.id;
    const existingProject = await Project.findById({ _id: projectId });
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    const stackData = await StackData.findOne({ siteId: projectId }).populate("type.materialId");
    if (!stackData) {
      return res.status(404).json({ message: "No stock data found for this project" });
    }
    if (stackData.type.length === 0) {
      return res.status(404).json({ message: "No stock entries found" });
    }

    const lastEntry = stackData.type.map(entry => ({
      materialId: entry.materialId.productName,
      lastValue: entry.values[entry.values.length - 1],
      lastDate: entry.date[entry.date.length - 1]
    }));
    res.status(200).json({ message: "Last stock entry retrieved successfully", lastEntry });

  } catch (error) {
    console.log("Error in stockproducts controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


