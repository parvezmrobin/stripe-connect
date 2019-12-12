import {Request, Response} from "express";
import {StripePayload, User, UserDocument} from "../models/User";
import Stripe from "stripe";
import logger from "../util/logger";
import {BookDocument, BookStore} from "../models/BookStore";

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

export const charge = async (req: Request, res: Response) => {
    logger.debug(req.body);
    let book: BookDocument;
    try {
        const bookId = req.body.id;
        const bookStore = await BookStore.findOne({"books._id": bookId}).exec();
        book = await bookStore.books.find(b => b._id.toString() === bookId);
        const user = await User.findOne({_id: bookStore.user}).exec();

        // Token is created using Stripe Checkout or Elements!
        // Get the payment token ID submitted by the form:
        const token = req.body.stripeToken; // Using Express
        const charge = await stripeClient.charges.create({
            amount: Math.ceil(book.price * 100), // price in cents
            currency: "aud",
            description: `Payment for book '${book.name}' from ${bookStore.name}`,
            source: token,
            application_fee_amount: Math.ceil(book.price * 10),
        }, {
            stripe_account: user.stripe.stripe_user_id,
        });
        const sale = {...charge, book: book._id};
        await BookStore.updateOne({_id: bookStore._id}, {$push: {sales: sale}});
        req.flash("success", [{msg: "Successfully brought book " + book.name}]);
        logger.debug(charge);
        res.redirect("/surf");
    } catch (e) {
        logger.error(e);
        req.flash("errors", [{msg: "Failed to purchase book " + book.name}]);
        res.redirect("/surf");
    }
};

export const disconnect = async (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    await User.updateOne({_id: user._id}, {$set: {stripe: {}}});
    res.redirect("/account");
};
