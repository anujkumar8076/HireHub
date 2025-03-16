const express=require('express');
const dotenv=require('dotenv');
const connectDB=require('./utils/db');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const userRoute=require('./routes/userRoute');
const companyRoute=require('./routes/companyRoute');
const jobRoute=require('./routes/jobRoute');
const applicationRoute=require('./routes/applicationRoutes');


dotenv.config();
const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


const corsOptions={
    origin:'http://localhost:5173',
    credentials:true

}

app.use(cors(corsOptions));

const PORT=process.env.PORT || 5000;

app.use("/api/v1/user",userRoute);
app.use('/api/v1/company',companyRoute);
app.use('/api/v1/job', jobRoute);
app.use('/api/v1/application',applicationRoute);





connectDB();
app.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
})