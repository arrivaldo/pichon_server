import mongoose from "mongoose"

import dotenv from 'dotenv'; // Add this line
dotenv.config(); // Load environment variables from the .env file


const connectToDatabase = async () => {

//GdUkE2mzjojTNBvj

    try{
            await mongoose.connect(process.env.MONGODB_URL)
            
    } catch(error) {
        console.log(error)
    }
}

export default connectToDatabase;