import express from "express";
import cors from "cors";
import { router } from "./routes/user.routes.js";

const app = express();


const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/csvimporter", router);


app.get('/', (req, res) => {
  res.status(200).json({
    status: "success",
    message: "GrowEasy AI CSV Importer API is live on Render!",
    timestamp: new Date().toISOString(),
    environment: "Production (Render)"
  });
});

export default app;
