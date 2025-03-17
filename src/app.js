import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { DBConnection } from "./database/DBConnection.js";
import { userRoutes } from "./routes/userRoutes.js";

dotenv.config({
  path: ".env",
});

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "HEAD"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(express.urlencoded())

app.get("/", (req, res) => {
  res.send("Hello Blog");
});

app.use("/api/users", userRoutes);

DBConnection()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `Server is listen on http://localhost:${process.env.PORT || 8400}`
      );
    });
  })
  .catch((error) => {
    console.log("mongodb connection error", error);
  });
