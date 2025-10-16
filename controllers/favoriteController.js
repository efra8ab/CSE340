// week 6 enhancement
const favoriteModel = require("../models/favorite-model")
const utilities = require("../utilities/")

async function buildFavorites(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const account = res.locals.accountData
    const favorites = account ? await favoriteModel.getFavoritesForAccount(account.account_id) : []
    return res.render("account/favorites", {
      title: "Saved Vehicles",
      nav,
      favorites
    })
  } catch (error) {
    return next(error)
  }
}

async function saveFavorite(req, res, next) {
  try {
    const account = res.locals.accountData
    const invId = Number(req.body.inv_id)
    if (!account || Number.isNaN(invId)) {
      req.flash("notice", "Vehicle could not be saved.")
      return res.redirect("/inv/")
    }
    const saved = await favoriteModel.addFavorite(account.account_id, invId)
    if (saved) {
      req.flash("notice", "Vehicle saved to favorites.")
    } else {
      req.flash("notice", "Vehicle was already in favorites.")
    }
    const redirectTo = req.body.redirectTo || "/account/favorite"
    return res.redirect(redirectTo)
  } catch (error) {
    req.flash("notice", "Vehicle could not be saved.")
    return res.redirect("/account/favorites")
  }
}

async function removeFavorite(req, res, next) {
  try {
    const account = res.locals.accountData
    const invId = Number(req.body.inv_id)
    if (!account || Number.isNaN(invId)) {
      req.flash("notice", "Vehicle could not be removed.")
      return res.redirect("/account/favorites")
    }
    const removed = await favoriteModel.removeFavorite(account.account_id, invId)
    if (!removed) {
      req.flash("notice", "We did not find that vehicle in favorites.")
    } else {
      req.flash("notice", "Vehicle removed from favorites.")
    }
    return res.redirect("/account/favorites")
  } catch (error) {
    req.flash("notice", "Vehicle could not be removed.")
    return res.redirect("/account/favorites")
  }
}

module.exports = {
  buildFavorites,
  saveFavorite,
  removeFavorite
}
