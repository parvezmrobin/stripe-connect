import {
    Book as IBook,
    BookStore as IBookStore,
    BookStoreCreateInput,
    BookStoreWhereInput,
    ID_Input as IdInput,
    prisma as Prisma
} from "../generated/prisma-client";
import {User} from "./User";

interface BookStoreWithBooks extends IBookStore {
    books: IBook[];
}

interface BookWithAuthorStore extends IBook{
    book: IBook;
    author: string;
    storeName: string;
}

export const BookStore = {
    findOne: async (query: BookStoreWhereInput) => {
        const bookStores = await Prisma.bookStores({
            where: query,
            first: 1
        });
        const bookStore = ((bookStores || [])[0]) as BookStoreWithBooks;
        bookStore.books = await Prisma.books({where: {bookStore: bookStore.id}});
        return bookStore;
    },
    create: (args: BookStoreCreateInput) => Prisma.createBookStore(args),
    addBook: (bookStore: IdInput, name: string, price: number) => Prisma.createBook({bookStore, name, price}),
    allBook: async () => {
        const books = await Prisma.books();
        const caches = {};
        const booksWithAuthorStore = books.map(async book => {
            const bookStoreId = book.bookStore;
            if (bookStoreId in caches) {
                const cache = caches[bookStoreId];
                return {
                    book,
                    author: cache.author,
                    storeName: cache.storeName,
                } as BookWithAuthorStore;
            }
            const bookStore = await BookStore.findOne({id: bookStoreId});
            const author = await User.findById(bookStore.user);
            const bookWithAuthorStore = {book} as BookWithAuthorStore;
            caches[bookStoreId] = {};
            caches[bookStoreId].author = bookWithAuthorStore.author = author.profile.name;
            caches[bookStoreId].storeName = bookWithAuthorStore.storeName = bookStore.name;
        });
        return booksWithAuthorStore;

    },
};
