
import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'  
})
import fs from 'fs'
if (!process.env.VERCEL && !fs.existsSync('./temp')) {
  fs.mkdirSync('./temp');
}
const { default: app } = await import('./app.js');
const PORT=process.env.PORT;
if (!process.env.VERCEL) {
    app.listen(PORT,()=>{
        console.log( `server is listening on port http://localhost:${PORT}`)
    })
}
export default app;