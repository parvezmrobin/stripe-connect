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
                code: req.query.code,
            });
        logger.debug(stripeResponse);

        const user = req.user as UserDocument;
        await User.updateOne({_id: user._id}, {$set: {stripe: stripeResponse}});
    } catch (e) {
        logger.error({
            statusCode: e.statusCode, type: e.type, message: e.message,
        });
    }
    return res.redirect("/account");
};

export const getPaymentForm = (req: Request, res: Response) => {
    res.render("payment");
};

export const charge = (req: Request, res: Response) => {
  logger.debug(req.body);
  res.json(req.body);
};
