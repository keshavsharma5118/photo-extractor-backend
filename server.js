const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "https://photo-extractor.vercel.app", credentials: true })); // Adjust origin for your frontend
app.use(express.json());
app.use(
  session({
    secret: "keshavsharma",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Use callback URL from environment variables
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Access Token:", accessToken);
      console.log("Profile:", profile);
      return done(null, profile);
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  (req, res) => {
    res.redirect("https://photo-extractor.vercel.app"); // Redirect to the frontend after login
  }
);

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    res.send({ message: "Logged out successfully" });
  });
});

app.get("/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else {
    res.status(401).send({ message: "Not authenticated" });
  }
});

// Image API
app.get("/image/:rollNumber", (req, res) => {
  const rollNumber = req.params.rollNumber;
  const imageUrl = `https://gietuerp.in/StudentDocuments/${rollNumber}/${rollNumber}.JPG`;
  res.send({ imageUrl });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
