import {Request, Response} from "express";
import {StripePayload, User, UserDocument} from "../models/User";
import Stripe from "stripe";
import logger from "../util/logger";

const stripeClient = new Stripe("sk_test_J4Z45kIzrgJ1GFy5qR0ovQ7L00B8lfIVr4");
export const validateStripeCall = async (req: Request, res: Response) => {
    /* eslint-disable @typescript-eslint/camelcase */
    try {
        const stripeResponse: StripePayload = await stripeClient.oauth
            .token({
                grant_type: "authorization_code",
                code: "ac_GIaJc9E6xfTZ4PU1XQT1XYS1gan87lSS",
            });
        if (stripeResponse.stripe_publishable_key !== "pk_test_asIQM8Tg70uCLDiL7dqoAXQA00XaUKZEqC") {
            return res.json({success: false});
        }

        const user = req.user as UserDocument;
        await User.updateOne({_id: user._id}, {$set: {stripe: stripeResponse}});
    } catch (e) {
        logger.error(e.statusCode, e.type, e.message);
    }
    return res.redirect("/account");
};
