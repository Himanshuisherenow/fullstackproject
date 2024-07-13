import { Button } from "@/components/ui/button";
import { CirclePlus, LoaderCircle, MoreHorizontal, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBook, getBooksAuthor, totalbooks } from "@/http/api";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

import { ProperDate } from "@/lib/utils";
import { Book } from "@/types";
import { PaginatedResponse } from "./BooksPage";

const HomePage = () => {
  const shuffleArray = (array: Book[]): Book[] => {
    // for (let i = array.length - 1; i > 0; i--) {
    //   const j = Math.floor(Math.random() * (i + 1));
    //   [array[i], array[j]] = [array[j], array[i]];
    // }
    return array;
  };
 
  const [deletingBookId, setDeletingBookId] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookCount"],
    queryFn: totalbooks,
  });

  const {
    data:boooks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
   error : eerror
  } = useInfiniteQuery({
    queryKey: ['books'],
    queryFn: getBooksAuthor(skip , limit , loadMore),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.hasMore) {
        return pages.length * 10;
      }
      return undefined;
    },
  });

  
  if (status == 'error') return <div>Error fetching books</div>;

  const { mutate, isPending } = useMutation({
    mutationKey: ["booksAuther"],
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booksAuther"] });
    },
  });


  if (error) {
    // console.log(typeof Query.data?.items);
    return <div>Error: {eerror}</div>;
  }

  if (!Array.isArray(boooks?.pages)) {
    return <div>No books available</div>;
  }
  const shuffledBooks = Array.isArray(boooks.pages)
    ? shuffleArray(boooks.items)
    : [];
  console.log(shuffledBooks);
  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex min-h-screen w-full flex-col">
          <main className="flex flex-1 flex-col gap-4 md:gap-6">
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
              <Card x-chunk="dashboard-01-chunk-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : error ? (
                    <div>Error fetching book count</div>
                  ) : (
                    <div className="text-2xl font-bold">{data?.count}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Total number of books available
                  </p>
                </CardContent>
              </Card>

              <Card x-chunk="dashboard-01-chunk-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Downloads
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    till now total download happened on our site
                  </p>
                </CardContent>
              </Card>
              <section>
                <Link to="/dashboard/books/create">
                  <Button className="h-12 border">
                    <CirclePlus size={20} />
                    <span className="ml-4">Add book</span>
                  </Button>
                </Link>
              </section>
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
              <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Image</span>
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Author name
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Created at
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shuffledBooks.map((book: Book) => {
                      return (
                        <TableRow
                          className={
                            isPending && book.id == deletingBookId
                              ? "opacity-40"
                              : "  hover:bg-muted/50"
                          }
                          key={book.id}
                        >
                          <TableCell className="hidden sm:table-cell">
                            <img
                              alt={book.title}
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={book.coverImage}
                              width="64"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {book.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{book.genre}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {book.author.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {ProperDate(book.createdAt)}
                          </TableCell>

                          <TableCell>
                            {isPending && book.id == deletingBookId ? (
                              <LoaderCircle className="animate-spin" />
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="outline"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  className="bg-white border w-20 rounded-lg  border-blue-100"
                                  align="end"
                                >
                                  <DropdownMenuLabel className="border-b border  border-b-slate-900">
                                    Actions
                                  </DropdownMenuLabel>
                                  <Link to={`/dashboard/books/edit/${book.id}`}>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                  </Link>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This
                                          will permanently delete your book and
                                          remove its data from our servers.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => {
                                            mutate(book.id);
                                            setDeletingBookId(book.id);
                                          }}
                                        >
                                          {isPending ? "Deleting..." : "Delete"}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </main>
        </div>
      </main>
    </>
  );
};

export default HomePage;
