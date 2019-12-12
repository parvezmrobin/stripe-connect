import mongoose, {Query} from "mongoose";
import {charges} from "stripe";

const ObjectId = mongoose.Schema.Types.ObjectId;
type ObjectId = mongoose.Types.ObjectId;
type addBookFunction = (name: string, price: number) => Query<BookStoreDocument>;

export type BookDocument = mongoose.Document & {
    name: string;
    price: number;
};
type ChargeDocument = mongoose.Document & charges.ICharge;
export type BookStoreDocument = mongoose.Document & {
    user: ObjectId;
    name: string;
    books: Array<BookDocument>;
    sales: Array<ChargeDocument>;
    addBook: addBookFunction;
};

const bookStoreSchema = new mongoose.Schema({
    user: ObjectId,
    name: String,
    books: [{name: String, price: {type: Number, min: 1}}],
    sales: [Object],
}, {timestamps: true});

bookStoreSchema.methods.addBook = function (name: string, price: number): Query<BookStoreDocument> {
    return this.updateOne({$push: {books: {name, price}}});
};

export const BookStore = mongoose.model<BookStoreDocument>("BookStore", bookStoreSchema);
