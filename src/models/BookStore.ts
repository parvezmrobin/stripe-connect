import mongoose, {Query} from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;
type ObjectId = mongoose.Types.ObjectId;
type addBookFunction = (name: string, price: number) => Query<BookStoreDocument>;

export type BookStoreDocument = mongoose.Document & {
    user: ObjectId;
    name: string;
    books: Array<{
       name: string;
       price: number;
    }>;
    addBook: addBookFunction;
};

const bookStoreSchema = new mongoose.Schema({
    user: ObjectId,
    name: String,
    books: [{name: String, price: Number}],
}, {timestamps: true});

bookStoreSchema.methods.addBook = function (name: string, price: number): Query<BookStoreDocument> {
    return this.updateOne({$push: {books: {name, price}}});
};

export const BookStore = mongoose.model<BookStoreDocument>("BookStore", bookStoreSchema);
