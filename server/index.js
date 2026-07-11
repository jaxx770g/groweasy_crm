
import dotenv from 'dotenv';
import fs from 'fs';
import app from './app.js'; 


dotenv.config();


if (!fs.existsSync('./temp')) {
  fs.mkdirSync('./temp');
}


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});