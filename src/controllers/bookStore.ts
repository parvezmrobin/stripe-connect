import {Request, Response} from "express";
import {check, validationResult} from "express-validator";
import {BookStore} from "../models/BookStore";
import {UserDocument} from "../models/User";

export const showBookStore = async (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    const store = await BookStore.findOne({user: user._id});
    res.render("bookStore", {
        title: "Your Store",
        store,
    });
};

export const createBookStore = async (req: Request, res: Response) => {
    await check("name", "Name cannot be blank").not().isEmpty().run(req);

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
