import HomePage from '@/pages/home';


const router = createBrowserRouter([

    {
    path: '/',
    element: <HomePage/>,
    
    },
    {
        path: '/login',
        element: <LoginPage/>,
        
        }
]);