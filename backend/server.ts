import { config } from "./src/config/config";
import app from "./src/app"

const startServer = () =>{

    const port = config.port || 8080;

    app.listen(port , ()=>{

        console.log(`your server is listening on port : ${port}`);
    })
}

startServer();