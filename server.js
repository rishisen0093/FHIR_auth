const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Your Private Key
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDc6WzU7xncyMTr
pOm24abgDQtMnsIEvrPCdNaff4vk2ewpJZXlIMQVvnYa5FwV0twulDkYVEnfsdwg
2x32h9mH7JNlciKGm/Ka1dugiDGk0APV98JExtJp7Djpka8V/1pGpOXLtj/vM2+z
SJWQxvyYVE54sGW23KGXStd7u2wap7507/q4AEYCM3x9SongN8Q2B/qqNqGO4W2J
JQ9xkGlNAprT+9Mgb1+ksL+otsPHT99UwD+50N2IbYIUNIlAXEfn6xja5JPCVLEd
dmSquAAO5TMNzYPbIiTN/owyV8bqnOK1AOhl9QMSwhyvkiyzo9rIc2dQ9vpwfd8g
iffdOk59AgMBAAECggEACJaDflioOPrOGvoPguZNUjb3mjwuvzf5rYTUxiETe2tU
YLofFGf8b3r2xO9dPBT1LdNhz9YRBCL6M4XJKakY1g2mokI4YOLFoOrQ7bH1uhpD
F+mYkgtnqSn/gWcCNzj01bu52jxEyoQFouLeu6Dct4BJh6wV3DDCEGteqqb72iJa
QJwZRlqmNt52wlG+nBTkkCXXNgAvpABP0KmPWxZJS10/5NSZGrKxgSCYg+1FfVJl
GQNURIj7k4psEiTg9XYXHfJq60wtfKFJciUpGsRBfTl8RYtRnYD1qoJtZCvcbOS1
T0OGS0dFrsbsLoaWCi4kiOyQmSu85s4sMZ1+NE/6EQKBgQD9Ms6JBj0ZB2FONsJK
DDVAb1s82twnlNpd9VkpZZXzdxuThMhdNCeYD4oEUtY7Eb7XLCEBygrGM2vOHDVn
6pClX+WvGYHuxaXkq63NcckNqCudmvFhum/4qCbv4zav/teenT5BR5+dMRXXdnl6
hn9Nq6JrWvUt4aBRa7OaB5pD0QKBgQDfWypSudVn9c3fUcK2D7H2/5Tqo+5R3bJf
vQ5wsg8SHktiCRdh/34YItG17q35tzYBG/GVN8SsV76yOpH4+6jCmyjFTAOWD1HS
NC2ZXWwFEUsuTVipy240ioO+g02+WMDzNWTMRBUk90p02yuUbrAsPgpU1nKIACzb
rPspIHCm7QKBgQCrRTHWGGU9x/M3P+0+v3FKC8lQqc7f612mzu6oBPJgxQHfUKNk
AIKD5ob6k7ocLM3FqTEOj8en+GKFAinSCCYd53drcTql9AZaXxLq9HwGg+o06vk6
nS1eqwfjnvOAK0dZII5bBALhBrH6lEZp7g6w0FfGfLl6drPGP682ksvz8QKBgQCC
1w3A7jmUL8rM0kFkk2cmEOw0U5mM/Xi7Wq112Oi5LWPtZvP6pUdBbkw47jud9/Q7
zBnF1qhwaOo9z8+o8gsXDPtiMDg9lHXS1FwN5ksb4NiQpCCXPqMtRiMM3DATnDxT
fGiyvANC51YHhEhQKFMtZ553ujPXdXrRqNBsdCNptQKBgQCTWIjo+8HT1NPe42Ad
K8gWBKxx7W5b8ffk7h4C+zuHgr9f2K0r9TU7tbzexphhWNx/EbcL/ewmgvRSIYc8
Vs0zUimHcwlK6dP1uCywbSXzzK0nTlQHyfDzkbXgx0nuMLHhPzVUzux72bSobpzq
W8YujzKvlP/kQs3cH5mb0sPIKw==
-----END PRIVATE KEY-----`;

// ==========================================
// CORE TOKEN GENERATOR (Reusable Helper)
// ==========================================
function generateToken(customPayload) {
    const uniqueJti = crypto.randomBytes(16).toString('hex');
    
    // Dynamic Expiration: 5 minutes from current time (Standard for OAuth assertions)
    const expirationTime = Math.floor(Date.now() / 1000) + (5 * 60);

    const payload = {
        exp: expirationTime,
        jti: uniqueJti,
        ...customPayload // Spreads the specific iss, sub, and aud passed from the endpoints
    };

    const signOptions = {
        algorithm: 'RS384',
        header: {
            typ: 'JWT',
            kid: 'connect4.healow.com'
        }
    };

    const token = jwt.sign(payload, PRIVATE_KEY, signOptions);
    return { token, jti: uniqueJti };
}

// ==========================================
// ENDPOINT 1: Single Patient (Production)
// ==========================================
app.get('/api/single-patient/token', (req, res) => {
    try {
        const payloadData = {
            iss: "38W1oSu4X_LKOpJEAB-55HwLX9AOdWbNSBkBb1ipdic",
            sub: "38W1oSu4X_LKOpJEAB-55HwLX9AOdWbNSBkBb1ipdic",
            aud: "https://oauthserver.eclinicalworks.com/oauth/oauth2/token"
        };

        const { token, jti } = generateToken(payloadData);

        res.status(200).json({ success: true, environment: "single-patient", jti_used: jti, token: token });
    } catch (error) {
        console.error("Single Patient Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate token" });
    }
});

// ==========================================
// ENDPOINT 2: Bulk Data Export
// ==========================================
app.get('/api/bulk/token', (req, res) => {
    try {
        // Note: Bulk FHIR requests sometimes use different client IDs (iss/sub). 
        // Update these if your bulk app uses different credentials.
        const payloadData = {
            iss: "tZ_KYyTqt8ryjWjhZpwEDPkDbxAGhh1KqKyr8c8zQas", // Replace if different from Single Patient
            sub: "tZ_KYyTqt8ryjWjhZpwEDPkDbxAGhh1KqKyr8c8zQas", // Replace if different from Single Patient
            aud: "https://oauthserver.eclinicalworks.com/oauth/oauth2/token" 
        };

        const { token, jti } = generateToken(payloadData);

        res.status(200).json({ success: true, environment: "bulk", jti_used: jti, token: token });
    } catch (error) {
        console.error("Bulk Token Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate token" });
    }
});

// ==========================================
// ENDPOINT 3: QA Single Patient (Sandbox)
// ==========================================
app.get('/api/qa-single-patient/token', (req, res) => {
    try {
        // Note: QA environments almost always have a different Audience (aud) URL 
        // and usually different client IDs. Update as needed based on your QA credentials.
        const payloadData = {
            iss: "gwJCLs2K0bHOconureXB8cQL1TvHeeaAx4AhZBfskc4", // Replace with your QA Issuer
            sub: "gwJCLs2K0bHOconureXB8cQL1TvHeeaAx4AhZBfskc4", // Replace with your QA Subject
            aud: "https://preprod-oauthserver.ecwcloud.com/oauth/oauth2/token" // Notice the QA URL
        };

        const { token, jti } = generateToken(payloadData);

        res.status(200).json({ success: true, environment: "qa-single-patient", jti_used: jti, token: token });
    } catch (error) {
        console.error("QA Single Patient Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate token" });
    }
});

// ==========================================
// SERVER START
// ==========================================
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`--- Test Endpoints ---`);
    console.log(`1. http://localhost:${PORT}/api/single-patient/token`);
    console.log(`2. http://localhost:${PORT}/api/bulk/token`);
    console.log(`3. http://localhost:${PORT}/api/qa-single-patient/token`);
});