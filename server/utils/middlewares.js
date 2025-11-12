const jwt = require('jsonwebtoken')

//check token is valid
function isAuthenticated(req, res, next) {
  const {authorization} = req.headers;

  if(!authorization) {
    return res.status(401).json({message: 'Un-Authorized'});
  }

  try{
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.payload = payload;
    
    
  }catch(err){
    if(err.name === 'TokenExpiredError') {
      throw new Error(err.name)
    }
    throw new Error('Un-Authorized');
  }

  return next();
}

function authorizeRole(...allowedRole){
  return (req, res, next) => {
    if(!req.payload){
      return res.status(401).json({ message: 'Unauthorized: missing user info' }); 
    }
    const {role} = req.payload
    if(!allowedRole.includes(role)) {
      return res.status(403).json({message: 'Access denied: insufficient permissions'})
    }

    next();
  };
}

module.exports = {
  isAuthenticated,
  authorizeRole
}