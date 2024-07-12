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
import {  getBooks } from "@/http/api";
import { Book } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ProperDate } from "@/lib/utils";

const BooksPage = () => {
  const Query = useQuery<Book[], Error>({
    queryKey: ["books"],
    queryFn: getBooks,
    staleTime: 10000,
  });

  // const [page, setPage] = useState(0);

  // const fetchProjects = (page = 0) =>
  //   fetch("http://localhost:7000/api/books?page=" + page).then((res) =>
  //     res.json()
  //   );

  // const { isLoading, isError, error, data, isFetching, isPreviousData } = useQuery({
  //     queryKey: ["projects", page],
  //     queryFn: () => fetchProjects(page),
  //     keepPreviousData: true,
  //   });

  const handleDownload = async (url1: string) => {
    try {
      const response = await fetch(
       url1
      );

    

      if (!Array.isArray(Query.data)) {
        return <div>No books available</div>;
      }

     
   
      if (Query.isLoading) {
        return <div>Loading...</div>;
      }
      
      if (Query.error) {
        return <div>Error: {Query.error.message}</div>;
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
          <CardDescription>
            Manage your books.
          </CardDescription>
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
              {Query.data && Query.data.map((book: Book) => {
                return (
                  <TableRow key={book._id}>
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
          {/* <div className="text-xs text-muted-for  eground">
            <div>
              {isLoading ? (
                <div>Loading...</div>
              ) : isError ? (
                <div>Error: {error.message}</div>
              ) : (
                <div>
                  {data?.map((data) => (
                    <p key={data.id}>{data.name}</p>
                  ))}
                </div>
              )}
              <span>Current Page: {page + 1}</span>
              <button
                onClick={() => setPage((old) => Math.max(old - 1, 0))}
                disabled={page === 0}
              >
                Previous Page
              </button>{" "}
              <button
                onClick={() => {
                  if (!isPreviousData && data?.data.hasMore) {
                    setPage((old) => old + 1);
                  }
                }}
                // Disable the Next Page button until we know a next page is available
                disabled={isPreviousData || !data?.data.hasMore}
              >
                Next Page
              </button>
              {isFetching ? <span> Loading...</span> : null}{" "}
            </div>
          </div> */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default BooksPage;
