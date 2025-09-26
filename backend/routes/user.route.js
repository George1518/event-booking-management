import express from "express";
import User from "../model/users.js";


const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

     
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

     
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

       
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role: role || 'user'
        });

        // Save user to database
        const savedUser = await user.save();

        // Create session
        req.session.userId = savedUser._id;
        req.session.userRole = savedUser.role;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: savedUser
        });

    } catch (error) {
        console.error("Registration error:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

       
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create session
        req.session.user = user
        req.session.userId = user._id;
        req.session.userRole = user.role;

        res.json({
            success: true,
            message: "Login successful",
            user: user
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({
            success: true,
            message: "Logout successful"
        });
    });
});

// Get current user profile
router.get('/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Check auth status
router.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({
            success: true,
            isAuthenticated: true,
            userId: req.session.userId,
            userRole: req.session.userRole
        });
    } else {
        res.json({
            success: true,
            isAuthenticated: false
        });
    }
});

export default router;