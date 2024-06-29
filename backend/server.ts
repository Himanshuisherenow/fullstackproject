import { config } from "./src/config/config";
import app from "./src/app"
import connectDB from './src/db/connectDB'

const startServer = () =>{

    const port = config.port || 8080;
    connectDB().catch(console.dir);
    app.listen(port , ()=>{
        console.log(`your server is listening on port : ${port}`);
    })
}

startServer();