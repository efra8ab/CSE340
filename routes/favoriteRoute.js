// week 6 enhancement
const express = require("express")
const router = new express.Router()
const favoriteController = require("../controllers/favoriteController")
const utilities = require("../utilities/")

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(favoriteController.buildFavorites)
)

router.post(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(favoriteController.saveFavorite)
)

router.post(
  "/remove",
  utilities.checkLogin,
  utilities.handleErrors(favoriteController.removeFavorite)
)

module.exports = router
