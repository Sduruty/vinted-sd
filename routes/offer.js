//---------->you are here : vinted/routes/user
const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

//***import models
const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.get("/offers", isAuthenticated, async (req, res) => {
  try {
    let filter = {};
    let sort = {};
    let pages = 0;
    const numberOfResults = 3;
    if (req.query.title) {
      filter.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.page) {
      if (req.query.page <= 1) {
        pages = 0;
      } else {
        pages = numberOfResults * req.query.page - numberOfResults;
      }
    }
    if (req.query.priceMax && req.query.priceMin) {
      filter.product_price = {
        $lte: req.query.priceMax,
        $gte: req.query.priceMin,
      };
    } else if (req.query.priceMax) {
      filter.product_price = {
        $lte: req.query.priceMax,
      };
    } else if (req.query.priceMin) {
      filter.product_price = {
        $gte: req.query.priceMin,
      };
    }
    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        sort.product_price = 1;
      } else if (req.query.sort === "price-desc") {
        sort.product_price = -1;
      }
    }
    const offer = await Offer.find(filter)
      .sort(sort)
      .limit(numberOfResults)
      .skip(pages);

    const counter = await Offer.countDocuments(filter);
    res.status(200).json({ offer, counter });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;

    if (price > 100000) {
      res.status(400).json({
        message: "Warning. Maximum price authorized : 100000.",
      });
    } else if (price <= 0) {
      res.status(400).json({
        message: "Warning. Minimum price authorized : 1.",
      });
    } else if (title.length > 50) {
      res.status(400).json({
        message: "Warning. Maximum 50 characters authorized.",
      });
    } else if (description.length > 500) {
      res.status(400).json({
        message: "Warning. Maximum 500 characters authorized.",
      });
    } else {
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user,
      });

      const result = await cloudinary.uploader.upload(req.files.picture.path, {
        folder: `/vinted/offers/${newOffer._id}`,
      });

      newOffer.product_image = result;

      await newOffer.save();
      res.json(newOffer);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/offer/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (offer) {
      await offer.deleteOne();
      res.status(200).json({
        message: "Well done. Your offer doesn't exist anymore.",
      });
    } else {
      res.status(400).json({
        message: "Are you sure this offer exists ? Couldn't find it...",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Dunno what happened...",
    });
  }
});

router.put("/offer/update/:id", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;

    if (price > 100000) {
      res.status(400).json({
        message: "Maximum price : 100000",
      });
    } else if (price <= 0) {
      res.status(400).json({
        message: "Minimum price : 1€",
      });
    } else if (title.length > 50) {
      res.status(400).json({
        message: "Title length must be under 50 characters.",
      });
    } else if (description.length > 500) {
      res.status(400).json({
        message: "Description length must be under 500 characters.",
      });
    } else {
      const offer = await Offer.findById(req.params.id);
      if (offer) {
        let pictureToUpload = req.files.picture.path;
        const picture = await cloudinary.uploader.upload(pictureToUpload, {
          folder: "/vinted",
          public_id: "preview",
        });
        offer.product_name = title;
        offer.product_description = description;
        offer.product_price = price;
        offer.product_image = picture;
        offer.product_details.condition = condition;
        offer.product_details.city = city;
        offer.product_details.brand = brand;
        offer.product_details.size = size;
        offer.product_details.color = color;
        await offer.save();
        res.status(200).json({
          message: "Offer modified",
        });
      } else {
        res.status(400).json({
          message: "Offer does not exist",
        });
      }
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/offer/:id", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account _id",
    });
    if (!offer) {
      res.status(400).json({
        message: "Offer does not exist",
      });
    } else {
      res.status(200).json(offer);
    }
  } catch (error) {
    res.status(400).json({
      message: "Bad request",
    });
  }
});

module.exports = router;
