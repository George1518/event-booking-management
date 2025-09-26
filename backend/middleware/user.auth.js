function auth(req, res, next) {

  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized – please login"
    });
  }
  next();
}

export default auth ;