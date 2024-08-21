// import React, { useState } from 'react';
// import { Link, redirect, useSearchParams } from "react-router-dom";
// import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { CirclePlus, LoaderCircle, MoreHorizontal, Users } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
//   DropdownMenuContent
// } from "@/components/ui/dropdown-menu";
// import { ProperDate } from "@/lib/utils";
// import { deleteBook, getBooksAuthor, totalbooks } from "@/http/api";
// import { PaginatedResponse } from './BooksPage';

// interface Book {
//   id: string;
//   title: string;
//   genre: string;
//   author: {
//     id: string;
//     name: string;
//   };
//   coverImage: string;
//   createdAt: string;
// }

// interface BookCountResponse {
//   count: number;
// }
// const HomePage: React.FC = () => {
//   const [deletingBookId, setDeletingBookId] = useState<string>("");
//   const queryClient = useQueryClient();

//   const { data: bookCountData, isLoading: isBookCountLoading, error: bookCountError } = useQuery<BookCountResponse, Error>({
//     queryKey: ["bookCount"],
//     queryFn: totalbooks,
//   });

//   const [searchParams, setSearchParams] = useSearchParams({
//     page: "1",
//     limit: "8",
//     type: "user",
//   });

//   const page = parseInt(searchParams.get("skip") || "1");
//   const limit = parseInt(searchParams.get("limit") || "8");

//   const { data: paginatedBooksData,isLoading,error } = useQuery<PaginatedResponse<Book>, Error>({
//     queryKey: ['books', page, limit, type],
//     queryFn: ()=>  getBooksAuthor(page, limit, type),
//     placeholderData: keepPreviousData,
//   });

//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>An error occurred</p>;

//   console.log(paginatedBooksData)

//   const { mutate, isPending } = useMutation({
//     mutationFn: deleteBook,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["books"] });
//     },
//   });

//   if (status === 'error' || (status === 'loading' && !booksData)) return <div>Loading or Error fetching books</div>;
//   const books = loadMore
//     ? booksData?.pages.flatMap(page => page.items) || []
//     : paginatedBooksData?.items || [];
//   const renderPagination = () => {

//     const totalPages = Math.ceil((paginatedBooksData?.total || 0) / limit);
//     const currentPage = Math.floor(skip / limit) + 1;
//     return (
//       <div className="flex justify-center mt-4 space-x-2">
//         <Button
//           onClick={() => setSearchParams({ skip: String(Math.max(0, skip - limit)), limit: String(limit), loadMore: "false", type })}
//           disabled={currentPage === 1}
//         >
//           Previous
//         </Button>
//         <span>{`Page ${currentPage} of ${totalPages}`}</span>
//         <Button
//           onClick={() => setSearchParams({ skip: String(skip + limit), limit: String(limit), loadMore: "false", type })}
//           disabled={currentPage === totalPages}
//         >
//           Next
//         </Button>
//       </div>
//     );
//   };

//   return (  <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
//     <div className="flex min-h-screen w-full flex-col">
//       <main className="flex flex-1 flex-col gap-4 md:gap-6">
//         <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Books</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {isBookCountLoading ? (
//                 <div>Loading...</div>
//               ) : bookCountError ? (
//                 <div>Error fetching book count</div>
//               ) : (
//                 <div className="text-2xl font-bold">{bookCountData?.count}</div>
//               )}
//               <p className="text-xs text-muted-foreground">Total number of books available</p>
//             </CardContent>
//           </Card>

//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Downloads</CardTitle>
//                 <Users className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">3</div>
//                 <p className="text-xs text-muted-foreground">Total downloads on our site</p>
//               </CardContent>
//             </Card>

//             <section>
//               <Link to="/dashboard/books/create">
//                 <Button className="h-12 border">
//                   <CirclePlus size={20} />
//                   <span className="ml-4">Add book</span>
//                 </Button>
//               </Link>
//             </section>
//           </div>

//           <div className="mb-4">
//             {/* <Button onClick={() => setSearchParams({ ...searchParams, loadMore: String(!loadMore) })}>
//               {loadMore ? "Switch to Pagination" : "Switch to Infinite Loading"}
//             </Button> */}
//           </div>

//           <Card className="xl:col-span-2">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="hidden w-[100px] sm:table-cell">
//                     <span className="sr-only">Image</span>
//                   </TableHead>
//                   <TableHead>Title</TableHead>
//                   <TableHead>Genre</TableHead>
//                   <TableHead className="hidden md:table-cell">Author name</TableHead>
//                   <TableHead className="hidden md:table-cell">Created at</TableHead>
//                   <TableHead>
//                     <span className="sr-only">Actions</span>
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//               {dataaa.map((book: Book) => (
//                   <TableRow
//                     className={isPending && book.id === deletingBookId ? "opacity-40" : "hover:bg-muted/50"}
//                     key={book.id}
//                   >
//                     <TableCell className="hidden sm:table-cell">
//                       <img
//                         alt={book.title}
//                         className="aspect-square rounded-md object-cover"
//                         height="64"
//                         src={book.coverImage}
//                         width="64"
//                       />
//                     </TableCell>
//                     <TableCell className="font-medium">{book.title}</TableCell>
//                     <TableCell>
//                       <Badge variant="outline">{book.genre}</Badge>
//                     </TableCell>
//                     <TableCell className="hidden md:table-cell">{book.author.name}</TableCell>
//                     <TableCell className="hidden md:table-cell">{ProperDate(book.createdAt)}</TableCell>
//                     <TableCell>
//                       {isPending && book.id === deletingBookId ? (
//                         <LoaderCircle className="animate-spin" />
//                       ) : (
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button aria-haspopup="true" size="icon" variant="outline">
//                               <MoreHorizontal className="h-4 w-4" />
//                               <span className="sr-only">Toggle menu</span>
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent className="bg-white border w-20 rounded-lg border-blue-100" align="end">
//                             <DropdownMenuLabel className="border-b border border-b-slate-900">Actions</DropdownMenuLabel>
//                             <Link to={`/dashboard/books/edit/${book.id}`}>
//                               <DropdownMenuItem>Edit</DropdownMenuItem>
//                             </Link>
//                             <AlertDialog>
//                               <AlertDialogTrigger asChild>
//                                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
//                               </AlertDialogTrigger>
//                               <AlertDialogContent>
//                                 <AlertDialogHeader>
//                                   <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                                   <AlertDialogDescription>
//                                     This action cannot be undone. This will permanently delete your book and remove its data from our servers.
//                                   </AlertDialogDescription>
//                                 </AlertDialogHeader>
//                                 <AlertDialogFooter>
//                                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                   <AlertDialogAction
//                                     onClick={() => {
//                                       mutate(book.id);
//                                       setDeletingBookId(book.id);
//                                     }}
//                                   >
//                                     {isPending ? "Deleting..." : "Delete"}
//                                   </AlertDialogAction>
//                                 </AlertDialogFooter>
//                               </AlertDialogContent>
//                             </AlertDialog>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//             { hasNextPage && (
//               <Button
//                 onClick={() => fetchNextPage()}
//                 disabled={isFetchingNextPage}
//                 className="mt-4"
//               >
//                 {isFetchingNextPage ? 'Loading more...' : 'Load More'}
//               </Button>
//             )}
//             { renderPagination()}
//           </Card>
//         </main>
//       </div>
//     </main>
//   );
// };

// export default HomePage;

// const dataaa = [
//   {
//     "id": "1",
//     "title": "The Great Gatsby",
//     "genre": "Fiction",
//     "author": {
//       "id": "100",
//       "name": "F. Scott Fitzgerald"
//     },
//     "coverImage": "https://example.com/images/great-gatsby.jpg",
//     "createdAt": "2024-08-21T10:00:00Z"
//   },
//   {
//     "id": "2",
//     "title": "1984",
//     "genre": "Dystopian",
//     "author": {
//       "id": "101",
//       "name": "George Orwell"
//     },
//     "coverImage": "https://example.com/images/1984.jpg",
//     "createdAt": "2024-08-20T12:00:00Z"
//   },
//   {
//     "id": "3",
//     "title": "To Kill a Mockingbird",
//     "genre": "Fiction",
//     "author": {
//       "id": "102",
//       "name": "Harper Lee"
//     },
//     "coverImage": "https://example.com/images/to-kill-a-mockingbird.jpg",
//     "createdAt": "2024-08-19T14:00:00Z"
//   },
//   {
//     "id": "4",
//     "title": "Pride and Prejudice",
//     "genre": "Romance",
//     "author": {
//       "id": "103",
//       "name": "Jane Austen"
//     },
//     "coverImage": "https://example.com/images/pride-and-prejudice.jpg",
//     "createdAt": "2024-08-18T16:00:00Z"
//   },
//   {
//     "id": "5",
//     "title": "Moby-Dick",
//     "genre": "Adventure",
//     "author": {
//       "id": "104",
//       "name": "Herman Melville"
//     },
//     "coverImage": "https://example.com/images/moby-dick.jpg",
//     "createdAt": "2024-08-17T18:00:00Z"
//   },
//   {
//     "id": "6",
//     "title": "War and Peace",
//     "genre": "Historical Fiction",
//     "author": {
//       "id": "105",
//       "name": "Leo Tolstoy"
//     },
//     "coverImage": "https://example.com/images/war-and-peace.jpg",
//     "createdAt": "2024-08-16T20:00:00Z"
//   },]
