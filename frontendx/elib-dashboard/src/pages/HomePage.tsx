import React, { useState } from 'react';
import { Link, useSearchParams } from "react-router-dom";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CirclePlus, LoaderCircle, MoreHorizontal, Search, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu";
import { ProperDate } from "@/lib/utils";
import { deleteBook, getBooksAuthor, totalbooks } from "@/http/api";
import { PaginatedResponse } from './BooksPage';
import { Input } from '@/components/ui/input';
import debounce from 'debounce';

interface Book {
  id: string;
  title: string;
  genre: string;
  author: {
    id: string;
    name: string;
  };
  coverImage: string;
  createdAt: string;
}

interface BookCountResponse {
  count: number;
}
const HomePage: React.FC = () => {
  const [deletingBookId, setDeletingBookId] = useState<string>("");
  const queryClient = useQueryClient();
 
  const { data: bookCountData, isLoading: isBookCountLoading, error: bookCountError } = useQuery<BookCountResponse, Error>({
    queryKey: ["bookCount"],
    queryFn: totalbooks,
  });

  const [searchParams, setSearchParams] = useSearchParams({
    page: "1",
    limit: "8",
    type: "user", 
    search: "",
  });
  
  

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "8");
  const type = searchParams.get("type")||"user";
  const search = searchParams.get("search") || "";



  const {data : paginateData ,isFetching, isLoading} = useQuery({
    queryKey: ["books", page, limit, type, search],
    queryFn: () => getBooksAuthor(page, limit, type, search), 
    placeholderData: keepPreviousData,
  })

  {isLoading && <LoaderCircle className="mx-auto" />}

  const totalPages = paginateData?.items ? Math.ceil(paginateData.total / limit) : 0;
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const handleMove = (direction: "next" | "prev") => {
    setSearchParams((prev) => {
    const newPage = direction === "next" ? page + 1 : Math.max(page - 1, 1);
    prev.set("page", newPage.toString());
    return prev;
  })}

  function handleSearch(e: { target: { value: string; }; }) {
    console.log(e.target.value);
    setSearchParams((prev) => {   
      prev.set("search", e.target.value);
      return prev;
    });
  }

  const { mutate, isPending } = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

 

  return (  <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    <form className="">
          <div className="relative mx-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              onChange={ debounce(handleSearch,300)}
              type="search"
              placeholder="Search products..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form> 
    <div className="flex min-h-screen w-full flex-col">
    
      <main className="flex flex-1 flex-col gap-4 md:gap-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              {isBookCountLoading ? (
                <div>Loading...</div>
              ) : bookCountError ? (
                <div>Error fetching book count</div>
              ) : (
                <div className="text-2xl font-bold">{bookCountData?.count}</div>
              )}
              <p className="text-xs text-muted-foreground">Total number of books available</p>
            </CardContent>
          </Card>

            <Card>  
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Total downloads on our site</p>
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


          <div className="mb-4">
            {/* <Button onClick={() => setSearchParams({ ...searchParams, loadMore: String(!loadMore) })}>
              {loadMore ? "Switch to Pagination" : "Switch to Infinite Loading"}
            </Button> */}
          </div>

          <Card className="xl:col-span-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead className="hidden md:table-cell">Author name</TableHead>
                  <TableHead className="hidden md:table-cell">Created at</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {paginateData?.items.map((book) => (
                  <TableRow
                    className={isPending && book.id === deletingBookId ? "opacity-40" : "hover:bg-muted/50"}
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
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{book.genre}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{book.author.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{ProperDate(book.createdAt)}</TableCell>
                    <TableCell>
                      {isPending && book.id === deletingBookId ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white border w-20 rounded-lg border-blue-100" align="end">
                            <DropdownMenuLabel className="border-b border border-b-slate-900">Actions</DropdownMenuLabel>
                            <Link to={`/dashboard/books/edit/${book.id}`}>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your book and remove its data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                ))}
              </TableBody>
            </Table>
            <div className="mx-auto w-full">

              {isFetching && <span>Loading...</span>}
            </div>
          </Card>
<section className='flex justify-center'>
<div className="flex items-center border-4 rounded-2xl ">
                <Button
                  onClick={() => handleMove("prev")}
                  disabled={currentPage === 1}
                  size="sm"
                  className="bg-white ml-2 hover:bg-gray-100 text-gray-800"
                >
                  ← Prev
                </Button>

                <span className="text-center font-semibold text-slate-700 text-sm p-2">
                  Page <span className=" border-slate-600">{currentPage} </span>
                  of <span className=" border-slate-600">{totalPages}</span>
                </span>
                <Button
                  onClick={() => handleMove("next")}
                  disabled={currentPage === totalPages}
                  size="sm"
                  className="  text-gray-800  hover:bg-gray-100 bg-white mr-2"
                >
                  Next →
                </Button>
              </div>
</section>
          
        </main>
      </div>
    </main>
  );
};

export default HomePage;



