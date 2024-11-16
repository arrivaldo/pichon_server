import mongoose from "mongoose"


const connectToDatabase = async () => {

//GdUkE2mzjojTNBvj

    try{
            await mongoose.connect(process.env.MONGODB_URL)
            
    } catch(error) {
        console.log(error)
    }
}

export default connectToDatabase;