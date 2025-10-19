// // const jwt = require('jsonwebtoken');


// // function authenticateUser(req, res, next) {
// //   const token = req.cookies.accessToken;
// //   if (!token) return res.status(401).json({ msg: 'Unauthorized' });

// //   try {
// //     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
// //     req.user = decoded;
// //     next();
// //   } catch (err) {
// //     res.status(403).json({ msg: 'Invalid Token' });
// //   }
// // }

// // module.exports = authenticateUser;

// const jwt = require('jsonwebtoken');

// function authenticateUser(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Access token missing' });
//   }

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ success: false, message: 'Invalid or expired access token' });
//     }
//     req.user = user; // Attach decoded user data to request
//     next();
//   });
// }

// module.exports = authenticateUser;
const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return res.status(401).json({ msg: 'Unauthorized: No token provided' });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // { userId, email, role, iat, exp }
    next();
  } catch (err) {
    console.error('authenticateUser error:', err.message || err);
    if (err.name === 'TokenExpiredError') return res.status(401).json({ msg: 'Access token expired' });
    return res.status(403).json({ msg: 'Invalid Token' });
  }
}

module.exports = authenticateUser;