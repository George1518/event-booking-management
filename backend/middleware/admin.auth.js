function requireRole(role) {
  return (req, res, next) => {
   
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized – please login first"
      });
    }

    if (req.session.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden – you don’t have permission"
      });
    }

    next();
  };
}

export default requireRole;