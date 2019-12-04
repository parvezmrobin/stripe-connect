import {Request, Response} from "express";
import axios from "axios";
import {StripePayload, User, UserDocument} from "../models/User";

export const validateStripeCall = (req: Request, res: Response) => {
    /* eslint-disable @typescript-eslint/camelcase */
    const url = "https://connect.stripe.com/oauth/token";
    axios
        .post(url, {
            client_secret: "sk_test_J4Z45kIzrgJ1GFy5qR0ovQ7L00B8lfIVr4",
            code: "ac_GIaJc9E6xfTZ4PU1XQT1XYS1gan87lSS",
            grant_type: "authorization_code",
        })
        .then(async stripeResponse => {
            const payload = stripeResponse.data as StripePayload;
            if (payload.stripe_publishable_key !== "pk_test_asIQM8Tg70uCLDiL7dqoAXQA00XaUKZEqC") {
                return res.json({success: false});
            }

            const user = req.user as UserDocument;
            await User.updateOne({_id: user._id}, {$set: {stripe: payload}});
            return res.redirect("/account");
        });
};
