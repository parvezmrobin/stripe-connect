import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;
type ObjectId = mongoose.Types.ObjectId;

export type BookStoreDocument = mongoose.Document & {
    user: ObjectId;
    name: string;
    books: Array<{
       name: string;
       price: number;
    }>;
};

const bookStoreSchema = new mongoose.Schema({
    user: ObjectId,
    name: String,
    books: [{name: String, price: Number}],
}, {timestamps: true});

bookStoreSchema.methods.addBook = function (name: string, price: number) {
    return this.updateOne({$push: {books: {name, price}}});
};

export const BookStore = mongoose.model<BookStoreDocument>("BookStore", bookStoreSchema);
