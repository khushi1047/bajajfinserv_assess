    require("dotenv").config();
    const express = require("express");
    const cors = require("cors");
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    const app = express();
    app.use(express.json());
    app.use(cors());

    const EMAIL = process.env.EMAIL || "abc.be23@chitkara.edu.in";


    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });



    const isPrime = (n) => {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
    };

    const fibonacci = (n) => {
    let arr = [0, 1];
    for (let i = 2; i < n; i++) {
        arr.push(arr[i - 1] + arr[i - 2]);
    }
    return arr.slice(0, n);
    };

    const gcd = (a, b) => (!b ? a : gcd(b, a % b));

    const lcm = (arr) =>
    arr.reduce((a, b) => (a * b) / gcd(a, b));

    const hcf = (arr) =>
    arr.reduce((a, b) => gcd(a, b));

  const askAI = async (question) => {
    try {
        const result = await model.generateContent(question);
        const text = result.response.text().trim();

        
        let match = text.match(/\*\*(.*?)\*\*/);
        if (match) return match[1]; 

     
        match = text.match(/is\s+([A-Za-z]+)/i);
        if (match) return match[1];

        return text.split(" ")[0];
    } catch (e) {
        console.error("AI Error:", e);
        return "Error";
    }
};



    app.post("/bfhl", async (req, res) => {
    try {
        const body = req.body;
        const keys = Object.keys(body);

        if (keys.length !== 1) {
        return res.status(400).json({
            is_success: false,
            error: "Exactly one key required",
        });
        }

        const key = keys[0];
        const value = body[key];

        let result;

        switch (key) {
        case "fibonacci":
            if (typeof value !== "number" || value < 1)
            throw new Error("Invalid number");
            result = fibonacci(value);
            break;

        case "prime":
            if (!Array.isArray(value))
            throw new Error("Array required");
            result = value.filter(isPrime);
            break;

        case "lcm":
            if (!Array.isArray(value))
            throw new Error("Array required");
            result = lcm(value);
            break;

        case "hcf":
            if (!Array.isArray(value))
            throw new Error("Array required");
            result = hcf(value);
            break;

        case "AI":
            if (typeof value !== "string")
            throw new Error("String required");
            result = await askAI(value);
            break;

        default:
            return res.status(400).json({
            is_success: false,
            error: "Invalid key",
            });
        }

        res.json({
        is_success: true,
        official_email: EMAIL,
        data: result,
        });

    } catch (err) {
        res.status(500).json({
        is_success: false,
        error: err.message,
        });
    }
    });


    app.get("/health", (req, res) => {
    res.json({
        is_success: true,
        official_email: EMAIL,
    });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
    );
