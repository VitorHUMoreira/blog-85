function middlewareTeste(req, res, next) {
  console.log("Passei pelo middleware teste");
  next();
}

module.exports = middlewareTeste;
