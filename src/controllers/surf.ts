import {Request, Response} from "express";
import {BookStore} from "../models/BookStore";

export const showBooks = async (req: Request, res: Response) => {
    const books = await BookStore.allBook();
    res.render("surf", {
        title: "Surf Books",
        books,
    });
};
