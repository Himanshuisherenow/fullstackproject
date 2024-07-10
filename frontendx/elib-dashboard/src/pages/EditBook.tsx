import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { getBook, updateBook } from '@/http/api';
import { useMutation ,useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
//import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
	title: z.string().min(2, {
		message: 'Title must be at least 2 characters.',
	}),
	genre: z.string().min(2, {
		message: 'Genre must be at least 2 characters.',
	}),
	description: z.string().min(2, {
		message: 'Description must be at least 2 characters.',
	}),
	coverImage: z.union([z.string(), z.instanceof(File)]).optional(),
	file: z.union([z.string(), z.instanceof(File)]).optional()
});


const EditBook = () => {
	const navigate = useNavigate();
	const { id } = useParams();

const form = useForm<z.infer<typeof formSchema>>({
	resolver: zodResolver(formSchema),
	defaultValues: async () => {
	const res = await getBook(id!);
	return {
		title: res?.data?.title,
		genre: res?.data?.genre,
		description: res?.data?.description,
		coverImage: res?.data?.coverImage,
		file: res?.data?.file,
	};
	},
  });
 
	const queryClient = useQueryClient();
	const {mutate,isPending,} = useMutation({
		mutationFn: updateBook,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['books'] });
			console.log('Book edited successfully');
			navigate('/dashboard/books');
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		const formdata = new FormData();
		formdata.append('title', values.title);
		formdata.append('genre', values.genre);
		formdata.append('description', values.description);
		
		if (values.coverImage instanceof File) {
		formdata.append('coverImage', values.coverImage);
		} else if (typeof values.coverImage === 'string') {
		formdata.append('coverImageUrl', values.coverImage);
		}
		
		if (values.file instanceof File) {
		formdata.append('file', values.file);
		} else if (typeof values.file === 'string') {
		formdata.append('fileUrl', values.file);
		}

		mutate({ id: id ? id : "", data: formdata });
	}

	return (
		<section>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className='flex items-center justify-between'>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href='/dashboard/home'>Home</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink href='/dashboard/books'>Books</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage>Edit</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
						<div className='flex items-center gap-4'>
							<Link to='/dashboard/books'>
								<Button variant={'outline'}>
									<span className='ml-2'>Cancel</span>
								</Button>
							</Link>
							<Button type="submit" disabled={isPending}>
                                {isPending && <LoaderCircle className="animate-spin" />}
                                <span className="ml-2">Submit</span>
                            </Button>
						</div>
					</div>
					<Card className='mt-6'>
						<CardHeader>
							<CardTitle>Edit Book</CardTitle>
							<CardDescription>
								Fill out the form below to create a new book.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid gap-6'>
								<FormField
									control={form.control}
									name='title'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input type='text' className='w-full' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='genre'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Genre</FormLabel>
											<FormControl>
												<Input type='text' className='w-full' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='description'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea className='min-h-32' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								
								
								<FormField
  control={form.control}
  name='coverImage'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Cover Image</FormLabel>
      <FormControl>
        <div>
          
          <Input
            type='file'
            className='w-full'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                field.onChange(file);
              }
            }}
          />
		{typeof field.value === 'string' && (
            <p>Current image: 
				<img src={field.value} alt='' className='w-1/2 h-1/2 ' />
			</p>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name='file'
  render={({ field }) => (
    <FormItem>
      <FormLabel>File</FormLabel>
      <FormControl>
        <div>
         
          <Input
            type='file'
            className='w-full'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                field.onChange(file);
              }
            }}
          />
		{typeof field.value === 'string' && (
      <></>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

									
						
							</div>
						</CardContent>
					</Card>
				</form>
			</Form>
		</section>
	);
};

export default EditBook;