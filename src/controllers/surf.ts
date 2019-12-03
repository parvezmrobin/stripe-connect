import {Request, Response} from "express";
import {BookStore} from "../models/BookStore";

export const showBooks = async (req: Request, res: Response) => {
    const books = await BookStore.aggregate()
        .unwind("$books")
        .lookup({
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "users",
        })
        .addFields({"author": {$arrayElemAt: ["$users", 0]}})
        .project({
            book: "$books",
            author: "$author.profile.name",
            storeName: "$name",
        });
    res.render("surf", {
        title: "Surf Books",
        books,
    });
};
