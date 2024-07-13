import { Badge } from "@/components/ui/badge";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBooks } from "@/http/api";
import { Book } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ProperDate } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams({
    skip: "0",
    limit: "8",
  });

  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = parseInt(searchParams.get("limit") || "8");

  const { data, isLoading, isError, error, isFetching } = useQuery<
    PaginatedResponse<Book>,
    Error
  >({
    queryKey: ["books", skip, limit],
    queryFn: () => getBooks(skip, limit),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const currentPage = Math.floor(skip / limit) + 1;

  const handleMove = (direction: "next" | "prev") => {
    setSearchParams((prev) => {
      const newSkip =
        direction === "next" ? skip + limit : Math.max(skip - limit, 0);
      prev.set("skip", newSkip.toString());
      return prev;
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const handleDownload = async (url1: string) => {
    try {
      const response = await fetch(url1);

      if (!Array.isArray(data?.items)) {
        return <div>No books available</div>;
      }

      if (isLoading) {
        return <div>Loading...</div>;
      }

      if (error) {
        return <div>Error: {error}</div>;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "fileName";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Books</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Books</CardTitle>
          <CardDescription>Manage your books.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {data?.items &&
                data.items.map((book: Book) => {
                  return (
                    <TableRow key={book.id}>
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
                        <Button
                          onClick={() => {
                            handleDownload(book.coverImage);
                          }}
                          variant={"outline"}
                        >
                          <span className="ml-2">Download</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <CardFooter className="mx-auto">
            <div className="mx-auto w-full">
              <div className="flex border-4 rounded-2xl ">
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
              {isFetching && <span>Loading...</span>}
            </div>
          </CardFooter>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BooksPage;
