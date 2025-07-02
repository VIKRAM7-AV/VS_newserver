import jwt from 'jsonwebtoken';

const projectToken = (projectId,res) => {
    const Project=jwt.sign({id:projectId}, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    res.cookie("project", Project, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: process.env.NODE_ENV !== "development",
        secure: false,
        sameSite: "lax",
    });
}

export default projectToken;