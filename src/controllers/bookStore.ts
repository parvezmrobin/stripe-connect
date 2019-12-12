import {Request, Response} from "express";
import {check, validationResult} from "express-validator";
import {BookStore} from "../models/BookStore";
import {UserDocument} from "../models/User";

export const showBookStore = async (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    const store = await BookStore.findOne({user: user._id})
        .select("name books sales");
    const totalSales = store && store.sales.length;
    const totalIncome = store && store.sales.reduce((sum, sale) => {
        return sum + sale.amount - sale.application_fee_amount;
    }, 0) / 100;
    res.render("bookStore", {
        title: "Your Store",
        hasStore: !!store,
        name: store ? store.name : "Your Store",
        books: store? store.books : [],
        totalSales,
        totalIncome,
    });
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
        const book = await BookStore.findOne({user: req.user._id, "books.name": name});
        if (!book) {
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
        await bookStore.addBook(req.body.name, req.body.price);
        req.flash("success", [{msg: "Successfully created your store"}]);
    }
    return res.redirect("/store");
};
