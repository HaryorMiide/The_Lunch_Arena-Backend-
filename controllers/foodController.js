const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const db = require("../db/config");
const logActivity = require("../utils/activityLogger");

const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");

const createFood = async (req, res) => {
  try {
    const { food_name, description, price, prep_time, category } = req.body;

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Image is required.",
      });
    }

    const foodSlug = food_name ? slugify(food_name) : "unknown";
    const timestamp = Date.now();
    const filename = `${foodSlug}-${timestamp}.webp`;

    const uploadDir = path.join(__dirname, "../Uploads");
    const outputPath = path.join(uploadDir, filename);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    await sharp(req.file.buffer)
      .resize({ width: 1000 })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const [id] = await db("food").insert({
      food_name,
      description,
      price,
      prep_time,
      category: category || "general", // Default to "general" if not provided
      image: filename,
    });

    await logActivity({
      action: "create",
      description: `Added new food item ${food_name}`,
      item_id: id,
      item_type: "food",
    });

    res.status(201).json({
      status: "success",
      message: "Food item created successfully.",
      image: filename,
      id,
    });
  } catch (err) {
    console.error("Error creating food:", err.message);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while creating the food item.",
    });
  }
};

const getFoods = async (req, res) => {
  try {
    const foods = await db("food").select("*");

    // Transform fields to match frontend interface
    const transformedFoods = foods.map((item) => ({
      id: item.id,
      name: item.food_name,
      description: item.description,
      price: item.price,
      category: item.category || "general", // Use "general" as default if category is null/undefined
      image: item.image,
      prepTime: item.prep_time,
    }));

    res.status(200).json({
      status: "success",
      data: transformedFoods,
    });
  } catch (err) {
    console.error("Error fetching foods:", err.message);
    res.status(500).json({
      status: "error",
      message: "Could not fetch foods.",
      error: err.message, 
    });
  }
};

const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { food_name, description, price, prep_time, category } = req.body;

    const updates = {
      ...(food_name && { food_name }),
      ...(description && { description }),
      ...(price && { price }),
      ...(prep_time && { prep_time }),
      ...(category && { category }), // Include category in updates if provided
    };

    const uploadDir = path.join(__dirname, "../Uploads");

    const existing = await db("food").where({ id }).first();
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Food item not found.",
      });
    }

    if (req.file) {
      const foodSlug = food_name ? slugify(food_name) : "unknown";
      const timestamp = Date.now();
      const filename = `${foodSlug}-${timestamp}.webp`;

      const outputPath = path.join(uploadDir, filename);

      await sharp(req.file.buffer)
        .resize({ width: 1000 })
        .webp({ quality: 80 })
        .toFile(outputPath);

      updates.image = filename;

      if (existing.image) {
        const oldPath = path.join(uploadDir, existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    await db("food").where({ id }).update(updates);

    await logActivity({
      action: "update",
      description: `Updated food item ${food_name}`,
      item_id: id,
      item_type: "food",
    });

    res.status(200).json({
      status: "success",
      message: "Food updated successfully.",
    });
  } catch (err) {
    console.error("Error updating food:", err.message);
    res.status(500).json({
      status: "error",
      message: "Could not update food.",
    });
  }
};

const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await db("food").where({ id }).first();

    if (!food) {
      return res.status(404).json({
        status: "error",
        message: "Food not found.",
      });
    }

    const imagePath = path.join(__dirname, "../Uploads", food.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await db("food").where({ id }).del();

    await logActivity({
      action: "delete",
      description: `Deleted food item ${food.food_name}`,
      item_id: id,
      item_type: "food",
    });

    res.status(200).json({
      status: "success",
      message: "Food deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting food:", err.message);
    res.status(500).json({
      status: "error",
      message: "Could not delete food.",
    });
  }
};

const getFoodCount = async (req, res) => {
  try {
    const [result] = await db("food").count("id as count");
    res.status(200).json({ total: result.count });
  } catch (error) {
    console.error("Error fetching food count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createFood,
  getFoods,
  updateFood,
  deleteFood,
  getFoodCount,
};
