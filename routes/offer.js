//---------->you are here : vinted/routes/offer
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
//***--------------middleware
const isAuthenticated = require("../middlewares/isAuthenticated");
//***-------------models
const User = require("../models/User");
const Offer = require("../models/Offer");
//***--------------publish an offer
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.fields);
    // console.log(req.files.picture.path);

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

    //***--------------create new offer without picture
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

    // console.log(newOffer);

    //***----------------send picture to cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer._id}`,
    });
    // console.log(result);
    //***add result to product_image
    newOffer.product_image = result;

    //***------------save offer
    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//***-------------------research in offers DB
router.get("/offers", isAuthenticated, async (req, res) => {
  try {
    if (req.query.sort === "price-desc" || req.query.sort === "price-asc") {
      //***--------if prices sorted from low to high or reverse
      if (req.query.priceMax && req.query.priceMin) {
        //***if price sort + price range requested

        const offers = await Offer.find({
          product_name: new RegExp(req.query.title, "i"),
          $and: [
            { product_price: { $lte: req.query.priceMax } },
            { product_price: { $gte: req.query.priceMin } },
          ],
        })
          .sort({ product_price: req.query.sort.replace("price-", "") })
          .select("product_name product_description product_price")
          .limit(2)
          .skip((req.query.page - 1) * 2);

        res.json(offers);
      } else {
        //***if price sort requested without price range
        const offers = await Offer.find({
          product_name: new RegExp(req.query.title, "i"),
          $or: [
            { product_price: { $lte: req.query.priceMax } },
            { product_price: { $gte: req.query.priceMin } },
          ],
        })
          .sort({ product_price: req.query.sort.replace("price-", "") })
          .select("product_name product_description product_price")
          .limit(2)
          .skip((req.query.page - 1) * 2);

        res.json(offers);
      }
    } else if (!req.query.sort) {
      if (req.query.priceMax && req.query.priceMin) {
        //no sorting but price range requested
        const offers = await Offer.find({
          product_name: new RegExp(req.query.title, "i"),
          $and: [
            { product_price: { $lte: req.query.priceMax } },
            { product_price: { $gte: req.query.priceMin } },
          ],
        })
          .select("product_name product_description product_price")
          .limit(2)
          .skip((req.query.page - 1) * 2);

        res.json(offers);
      } else {
        //no sorting and no price range requested
        const offers = await Offer.find({
          product_name: new RegExp(req.query.title, "i"),
          $or: [
            { product_price: { $lte: req.query.priceMax } },
            { product_price: { $gte: req.query.priceMin } },
          ],
        })
          .select("product_name product_description product_price")
          .limit(2)
          .skip((req.query.page - 1) * 2);

        res.json(offers);
      }
    } else {
      //wrong parameters provided
      res.status(400).json({ message: "Wrong parameters provided" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
