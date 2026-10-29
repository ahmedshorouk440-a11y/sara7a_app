

import jwt from "jsonwebtoken";



export const generateToken = async (user) => {

    let aud;
    let signature;
    let refreshSignature;

    switch (user.role) {

        case "admin":
            signature = "AdminSignature";
            aud = "admin";
            refreshSignature = "AdminRefreshSignature";
            break;

        default:
            signature = "UserSignature";
            aud = "user";
            refreshSignature = "UserRefreshSignature";
    }

    let AccessToken = jwt.sign({ id: user._id },signature,{ expiresIn: "30min",audience: aud});

    let RefreshToken = jwt.sign({ id: user._id },refreshSignature,{expiresIn: "1y",audience: aud}
    );

    return {
        AccessToken,
        RefreshToken
    };
};



export const generateAccessToken = async (refreshToken) => {

    if (!refreshToken) {
        throw new Error("Refresh Token is required");
    }

   
    let decoded = jwt.decode(refreshToken);

    if (!decoded || !decoded.aud) {
        throw new Error("Invalid Refresh Token");
    }

    let refreshSignature;

    switch (decoded.aud) {

        case "admin":
            refreshSignature = "AdminRefreshSignature";
            break;

        case "user":
            refreshSignature = "UserRefreshSignature";
            break;

        default:
            throw new Error("Invalid Audience");
    }

    
    let decodedData = jwt.verify( refreshToken, refreshSignature
    );

    let accessSignature;

    switch (decodedData.aud) {

        case "admin":
            accessSignature = "AdminSignature";
            break;

        case "user":
            accessSignature = "UserSignature";
            break;

        default:
            throw new Error("Invalid Audience");
    }
    let AccessToken = jwt.sign({ id: decodedData.id },accessSignature,{ expiresIn: "30min", audience: decodedData.aud}
    );

    return {
        accessToken: AccessToken
    };
};