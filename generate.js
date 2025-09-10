const jwt = require("jsonwebtoken");

const payload = { userId: 123, username: "gk", role: "student" };
const secret = "my_super_secret_key"; // keep this safe!
const options = { expiresIn: "1h" }; // token valid for 1 hour

const token = jwt.sign(payload, secret, options);

console.log("Your JWT:", token);
