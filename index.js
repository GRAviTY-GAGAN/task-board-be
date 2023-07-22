const express = require("express");
const { connection } = require("./db");
const cors = require("cors");
const { userRouter } = require("./Routes/user.Routes");
const { BoardRouter } = require("./Routes/Board.Routes");
require("dotenv").config();

const port = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/user", userRouter);
app.use("/boards", BoardRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Task Boards.");
});

app.listen(port, async () => {
  try {
    await connection;
    console.log(`DB Connected.`);
    console.log(`Server running at port ${port}`);
  } catch (error) {
    console.log(error.message);
  }
});
