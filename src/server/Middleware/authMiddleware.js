import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization failed. No or malformed token." });
    }

    const token = authHeader.split(' ')[1];

    try {
       
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
      

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

export const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Access denied. Role mismatch." });
        }
        next();
    };
};