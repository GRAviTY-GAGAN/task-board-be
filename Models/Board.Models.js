const mongoose = require("mongoose");

// BOARD

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tasks: { type: Array, required: true },
    userID: { type: String, required: true },
  },
  { versionKey: false }
);

const BoardModal = new mongoose.model("board", boardSchema);

// TASK

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: "Todo" },
    subtask: [String],
    boardID: { type: String, required: true },
  },
  { versionKey: false }
);

const TaskModal = new mongoose.model("task", taskSchema);

// SUBTASK

const subTaskSchema = new mongoose.Schema(
  {
    subTaskID: { type: String },
    task: { type: String },
    status: { type: Boolean },
  },
  { versionKey: false }
);

const subTaskModal = new mongoose.model("subtask", subTaskSchema);

module.exports = { BoardModal, TaskModal, subTaskModal };
