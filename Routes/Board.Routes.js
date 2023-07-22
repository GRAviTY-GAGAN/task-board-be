const express = require("express");
const {
  BoardModal,
  TaskModal,
  subTaskModal,
} = require("../Models/Board.Models");
const { tokenDecoder } = require("../Middlewares/TokenDecoder");

const BoardRouter = express.Router();

BoardRouter.get("/", tokenDecoder, async (req, res) => {
  const { userID } = req.body;
  // console.log(req.body, "HERE");
  try {
    const boards = await BoardModal.find({ userID });

    res.json({ msg: "yes", boards });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

BoardRouter.delete("/:id", tokenDecoder, async (req, res) => {
  const { userID } = req.body;
  const { id } = req.params;
  // console.log(req.body, "HERE");
  try {
    const findBoard = await BoardModal.findOne({ _id: id });

    const findTasks = await TaskModal.find({ _id: { $in: findBoard.tasks } });

    let subtaskIDs = [];

    findTasks.forEach((task) => {
      subtaskIDs.push(...task.subtask);
    });

    const subtask = await subTaskModal.deleteMany({
      subTaskID: { $in: subtaskIDs },
    });

    const tasks = await TaskModal.deleteMany({ _id: { $in: findBoard.tasks } });

    const board = await BoardModal.findOneAndDelete({ _id: id });

    res.json({ msg: "Board Deleted with all its tasks and subtasks." });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

BoardRouter.post("/", tokenDecoder, async (req, res) => {
  const { name, tasks, userID } = req.body;

  try {
    const board = new BoardModal({ name, tasks, userID });
    await board.save();
    res.json({ msg: "Board Created", board });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

BoardRouter.post("/task", async (req, res) => {
  const { title, description, status, subTasks, boardID } = req.body.task;
  // console.log(req.body.task.subtask);
  try {
    const task = new TaskModal({
      title,
      description,
      status,
      subtask: subTasks,
      boardID,
    });

    const findBoard = await BoardModal.findOneAndUpdate(
      { _id: boardID },
      { $push: { tasks: task._id } }
    );

    if (!findBoard) {
      return res.status(400).json({ msg: "Board Not Found." });
    }

    await task.save();

    const subtask = subTaskModal.insertMany(req.body.subtasks);
    // await subtask.save();

    res.json({ msg: "Task Added", findBoard, subtask, task });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

BoardRouter.delete("/task/:id/:boardID", async (req, res) => {
  const { id, boardID } = req.params;
  //   const { boardID } = req.body.;
  // console.log(boardID);

  try {
    const findTask = await TaskModal.findOne({ _id: id });
    // console.log(findTask, "FOUND");

    const task = await TaskModal.findOneAndDelete({ _id: id });

    const board = await BoardModal.findOne({ _id: boardID });

    let tasks = board.tasks;

    let newtasks = tasks.filter((task) => {
      if (task._id == id) {
        return false;
      } else {
        return true;
      }
    });

    const newboard = await BoardModal.findOneAndUpdate(
      { _id: boardID },
      { tasks: newtasks },
      { new: true }
    );

    const boards = await BoardModal.find();

    res.json({ msg: "Board Deleated", boards, newboard });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

BoardRouter.get("/newTasksFetch/:id", async (req, res) => {
  const { id: boardID } = req.params;

  try {
    const board = await BoardModal.findOne({ _id: boardID });

    const tasks = await TaskModal.find({ _id: { $in: board.tasks } });

    let subtasksArray = [];

    tasks.forEach((task) => {
      subtasksArray.push(...task.subtask);
    });

    const subTasks = await subTaskModal.find({
      subTaskID: { $in: subtasksArray },
    });

    res.json({ msg: "success", board, tasks, subTasks });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

BoardRouter.post("/tasksAndSubTasks", async (req, res) => {
  const { taskSubTaskID: idArray } = req.body;

  try {
    const subTasks = await subTaskModal.find({ subTaskID: { $in: idArray } });

    res.json({ msg: "Success", subTasks });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

BoardRouter.patch("/subtaskUpdate/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const subTask = await subTaskModal.findOneAndUpdate(
      { _id: id },
      { status: req.body.status },
      { new: true }
    );

    res.json({ msg: "Subtask updated", subTask });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

BoardRouter.patch("/task/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const task = await TaskModal.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );

    res.json({ msg: "Task updated", task });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

BoardRouter.delete("/taskDelete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const findtask = await TaskModal.findOne({ _id: id });

    const subTask = await subTaskModal.deleteMany({
      subTaskID: { $in: findtask.subtask },
    });

    const task = await TaskModal.findOneAndDelete({ _id: id });

    res.json({ msg: "Success Deleted", task });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

module.exports = { BoardRouter };
