const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    } else {
      res.redirect("/login"); // Redirect to login page if not logged in
    }
  };

  module.exports = isAuthenticated