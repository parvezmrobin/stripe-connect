import {Request, Response} from "express";
import {check, validationResult} from "express-validator";
import {BookStore} from "../models/BookStore";
import {UserDocument} from "../models/User";
import logger from "../util/logger";

export const showBookStore = async (req: Request, res: Response) => {
    try {
        const user = req.user as UserDocument;
        const store = await BookStore.findOne({user: user._id});
        res.render("bookStore", {
            title: "Your Store",
            store,
        });
    } catch (e) {
        for (const key in e.result.errors) {
            if (e.result.errors.hasOwnProperty(key)) {
                logger.error(key, ":", e.result.errors[key]);
            }
        }
        res.render("bookStore", {
            title: "Your Store",
            store: {books: []},
        });
    }
};

export const createBookStore = async (req: Request, res: Response) => {
    await check("name", "Name cannot be blank").not().isEmpty().run(req);
    await check("name", "You already have a store").custom(async (name, {req}) => {
        return !await BookStore.findOne({user: req.user._id});
    }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
    } else {
        const user = req.user as UserDocument;
        await BookStore.create({
            user: user._id,
            name: req.body.name,
        });
        req.flash("success", [{msg: "Successfully created your store"}]);
    }
    return res.redirect("/store");
};

export const createBook = async (req: Request, res: Response) => {
    await check("name", "Name cannot be blank").not().isEmpty().run(req);
    await check("name").custom(async (name, {req}) => {
        const bookStore = await BookStore.findOne({user: req.user._id});
        if (!bookStore) {
            return true;
        }

        throw new Error("You already have book with this name");
    }).run(req);
    await check("price", "Price must be a valid positive number").isFloat({min: 0}).not().isEmpty().run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
    } else {
        const user = req.user as UserDocument;
        const bookStore = await BookStore.findOne({user: user._id});
        await BookStore.addBook(bookStore.id, req.body.name, req.body.price);
        req.flash("success", [{msg: "Successfully created your store"}]);
    }
    return res.redirect("/store");
};
