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

const createRental = async (req, res) => {
  try {
    const { title, description, price, price_type, category, available } =
      req.body;

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Image is required.",
      });
    }

    const rentalSlug = title ? slugify(title) : "unknown";
    const timestamp = Date.now();
    const filename = `${rentalSlug}-${timestamp}.webp`;

    const uploadDir = path.join(__dirname, "../Uploads");
    const outputPath = path.join(uploadDir, filename);

    // Ensure uploads folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Resize and compress image using Sharp
    await sharp(req.file.buffer)
      .resize({ width: 1000 })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Save to MySQL with available field
    const [id] = await db("rentals").insert({
      title,
      description,
      price,
      price_type,
      category: category || "general",
      image: filename,
      available:
        available === "true" || available === "on" || available === true, // Convert to boolean
    });

    // Log the create activity
    await logActivity({
      action: "create",
      description: `Added new rental item ${title}`,
      item_id: id,
      item_type: "rental",
    });

    res.status(201).json({
      status: "success",
      message: "Rental item created successfully.",
      image: filename,
    });
  } catch (err) {
    console.error("Error creating rental:", err.message);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while creating the rental item.",
    });
  }
};

const getRentals = async (req, res) => {
  try {
    const rentals = await db("rentals").select("*").orderBy("id", "desc");

    res.status(200).json({
      status: "success",
      data: rentals,
    });
  } catch (err) {
    console.error("Error fetching rentals:", err.message);
    res.status(500).json({
      status: "error",
      message: "Could not fetch rentals.",
    });
  }
};

const updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, price_type, category, available } =
      req.body;

    const updates = {
      ...(title && { title }),
      ...(description && { description }),
      ...(price && { price }),
      ...(price_type && { price_type }),
      ...(category && { category }),
      ...(available !== undefined && {
        available:
          available === "true" || available === "on" || available === true,
      }), // Handle available field
    };

    const uploadDir = path.join(__dirname, "../Uploads");

    // Check if rental exists first
    const existing = await db("rentals").where({ id }).first();
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Rental item not found.",
      });
    }

    // If image is being updated
    if (req.file) {
      const rentalSlug = title ? slugify(title) : "unknown";
      const timestamp = Date.now();
      const filename = `${rentalSlug}-${timestamp}.webp`;

      const outputPath = path.join(uploadDir, filename);

      await sharp(req.file.buffer)
        .resize({ width: 1000 })
        .webp({ quality: 80 })
        .toFile(outputPath);

      updates.image = filename;

      // Delete old image
      if (existing.image) {
        const oldPath = path.join(uploadDir, existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    await db("rentals").where({ id }).update(updates);

    // Log the update activity
    await logActivity({
      action: "update",
      description: `Updated rental item ${title || existing.title}`,
      item_id: id,
      item_type: "rental",
    });

    res.status(200).json({
      status: "success",
      message: "Rental updated successfully.",
    });
  } catch (err) {
    console.error("Error updating rental:", err.message);
    res.status(500).json({
      status: "error",
      message: "Could not update rental.",
    });
  }
};

const deleteRental = async (req, res) => {
  try {
    const { id } = req.params;

    const rental = await db("rentals").where({ id }).first();

    if (!rental) {
      return res.status(404).json({
        status: "error",
        message: "Rental not found.",
      });
    }

    // Delete image
    const imagePath = path.join(__dirname, "../Uploads", rental.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await db("rentals").where({ id }).del();

    // Log the delete activity
    await logActivity({
      action: "delete",
      description: `Deleted rental item ${rental.title}`,
      item_id: id,
      item_type: "rental",
    });

    res.status(200).json({
      status: "success",
      message: "Rental deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting rental:", err.message);
    res.status(500).json({
      status: "error",
      message: "Could not delete rental.",
    });
  }
};

// Get total count of rentals
const getRentalCount = async (req, res) => {
  try {
    const [result] = await db("rentals").count("id as count");
    res.status(200).json({ total: result.count });
  } catch (error) {
    console.error("Error fetching rental count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAvailableRentalCount = async (req, res) => {
  try {
    const [result] = await db("rentals")
      .where("available", true)
      .count("id as count");

    res.status(200).json({ available: result.count });
  } catch (error) {
    console.error("Error fetching available rental count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createRental,
  getRentals,
  updateRental,
  deleteRental,
  getRentalCount,
  getAvailableRentalCount,
};
