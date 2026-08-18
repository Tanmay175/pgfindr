const PG = require("../models/PG");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../utils/uploadToCloudinary");

const ROOM_TYPES = ["single", "double", "triple", "four_sharing"];

// Escapes regex metacharacters so user search input can't build an
// unintended (or maliciously expensive/ReDoS-prone) regex pattern.
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseIfString(val) {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

// POST /api/pgs (owner only)
async function createPG(req, res, next) {
  try {
    const body = req.body;
    const rooms = parseIfString(body.rooms) || [];
    const amenities = parseIfString(body.amenities) || [];
    const rules = parseIfString(body.rules) || {};
    const location = parseIfString(body.location);
    const pricing = parseIfString(body.pricing) || {};

    if (!body.name || !body.pgType || !body.gender || !location?.address || !location?.city) {
      return res.status(400).json({ success: false, message: "Name, type, gender, address and city are required" });
    }
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ success: false, message: "At least one room type is required" });
    }
    for (const r of rooms) {
      if (!ROOM_TYPES.includes(r.type)) {
        return res.status(400).json({ success: false, message: `Invalid room type: ${r.type}` });
      }
      if (r.totalRooms < 0 || r.availableRooms < 0 || r.availableRooms > r.totalRooms) {
        return res.status(400).json({ success: false, message: "Invalid room counts" });
      }
      if (r.price < 0) {
        return res.status(400).json({ success: false, message: "Room price cannot be negative" });
      }
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((f) => uploadBufferToCloudinary(f.buffer, "pgfindr/pg-images"))
      );
      images = uploads.map((u, i) => ({ url: u.url, publicId: u.publicId, isCover: i === 0 }));
    }

    const pg = await PG.create({
      owner: req.user._id,
      name: body.name,
      description: body.description,
      pgType: body.pgType,
      gender: body.gender,
      location,
      pricing,
      rooms,
      amenities,
      rules,
      images,
    });

    res.status(201).json({ success: true, message: "PG added successfully", pg });
  } catch (err) {
    next(err);
  }
}

// GET /api/pgs — public search/list with filters
async function getPGs(req, res, next) {
  try {
    const {
      search,
      city,
      minPrice,
      maxPrice,
      gender,
      roomType,
      amenities,
      minRating,
      availableOnly,
      food,
      ac,
      parking,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { status: "active" };

    if (search && typeof search === "string") {
      const safe = escapeRegex(search.slice(0, 100));
      filter.$or = [
        { name: { $regex: safe, $options: "i" } },
        { "location.city": { $regex: safe, $options: "i" } },
        { "location.nearbyCollege": { $regex: safe, $options: "i" } },
      ];
    }
    if (city && typeof city === "string") filter["location.city"] = { $regex: `^${escapeRegex(city.slice(0, 100))}$`, $options: "i" };
    if (gender && ["male", "female", "any"].includes(gender)) filter.gender = gender;
    if (minRating && !isNaN(Number(minRating))) filter["rating.average"] = { $gte: Number(minRating) };
    if (roomType && ROOM_TYPES.includes(roomType)) filter["rooms.type"] = roomType;

    const amenityList = amenities
      ? (Array.isArray(amenities) ? amenities : String(amenities).split(",")).filter((a) => typeof a === "string").slice(0, 20)
      : [];
    if (food === "true") amenityList.push("Food");
    if (ac === "true") amenityList.push("AC");
    if (parking === "true") amenityList.push("Parking");
    if (amenityList.length > 0) filter.amenities = { $all: amenityList };

    if (availableOnly === "true") filter["rooms.availableRooms"] = { $gt: 0 };

    if ((minPrice && !isNaN(Number(minPrice))) || (maxPrice && !isNaN(Number(maxPrice)))) {
      const priceMatch = {};
      if (minPrice && !isNaN(Number(minPrice))) priceMatch.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) priceMatch.$lte = Number(maxPrice);
      filter["rooms.price"] = priceMatch;
    }

    let sortSpec = { createdAt: -1 };
    if (sort === "price_asc") sortSpec = { "rooms.0.price": 1 };
    else if (sort === "price_desc") sortSpec = { "rooms.0.price": -1 };
    else if (sort === "rating") sortSpec = { "rating.average": -1 };
    else if (sort === "newest") sortSpec = { createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));

    const [pgs, total] = await Promise.all([
      PG.find(filter)
        .sort(sortSpec)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("owner", "name phone"),
      PG.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: pgs.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      pgs,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/pgs/:id
async function getPGById(req, res, next) {
  try {
    const pg = await PG.findById(req.params.id).populate("owner", "name phone email");
    if (!pg) return res.status(404).json({ success: false, message: "PG not found" });
    res.json({ success: true, pg });
  } catch (err) {
    next(err);
  }
}

// PUT /api/pgs/:id (owner of this PG only)
async function updatePG(req, res, next) {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: "PG not found" });
    if (String(pg.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You do not own this PG" });
    }

    const body = req.body;
    const updatable = ["name", "description", "pgType", "gender", "status"];
    updatable.forEach((f) => {
      if (body[f] !== undefined) pg[f] = body[f];
    });

    if (body.location) pg.location = { ...pg.location.toObject(), ...parseIfString(body.location) };
    if (body.pricing) pg.pricing = { ...pg.pricing.toObject(), ...parseIfString(body.pricing) };
    if (body.rules) pg.rules = { ...pg.rules.toObject(), ...parseIfString(body.rules) };
    if (body.amenities) pg.amenities = parseIfString(body.amenities);
    if (body.rooms) pg.rooms = parseIfString(body.rooms);

    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((f) => uploadBufferToCloudinary(f.buffer, "pgfindr/pg-images"))
      );
      const newImages = uploads.map((u) => ({ url: u.url, publicId: u.publicId, isCover: false }));
      pg.images.push(...newImages);
    }

    await pg.save();
    res.json({ success: true, message: "PG updated successfully", pg });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/pgs/:id (owner of this PG only)
async function deletePG(req, res, next) {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: "PG not found" });
    if (String(pg.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You do not own this PG" });
    }

    await Promise.all(pg.images.map((img) => deleteFromCloudinary(img.publicId)));
    await pg.deleteOne();

    res.json({ success: true, message: "PG deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/pgs/:id/images/:imageId (owner only)
async function deletePGImage(req, res, next) {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: "PG not found" });
    if (String(pg.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You do not own this PG" });
    }

    const image = pg.images.id(req.params.imageId);
    if (!image) return res.status(404).json({ success: false, message: "Image not found" });

    await deleteFromCloudinary(image.publicId);
    pg.images.pull(req.params.imageId);
    await pg.save();

    res.json({ success: true, message: "Image deleted", pg });
  } catch (err) {
    next(err);
  }
}

// PUT /api/pgs/:id/images/:imageId/cover (owner only)
async function setCoverImage(req, res, next) {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: "PG not found" });
    if (String(pg.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You do not own this PG" });
    }

    pg.images.forEach((img) => {
      img.isCover = String(img._id) === req.params.imageId;
    });
    await pg.save();

    res.json({ success: true, message: "Cover image updated", pg });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPG,
  getPGs,
  getPGById,
  updatePG,
  deletePG,
  deletePGImage,
  setCoverImage,
};
