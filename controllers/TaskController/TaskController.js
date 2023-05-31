import GroupModel from '../../models/Group.js'
import handleError  from '../../utils/handleError.js';

export const getAll = async (req, res) => {
    try {
      const groupId = req.params.groupId;
  
      const group = await GroupModel.findOne({
        _id: groupId,
        user: req.userId
      });
  
      if (!group) {
        return res.status(404).json({
          message: "Група не знайдена"
        });
      }
  
      res.json(group.tasks);
    } catch (error) {
      console.log(error);
        handleError(res, "Не вдалося отримати завдання");
    }
  };

export const create = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const task = req.body;
        const group = await GroupModel.findOneAndUpdate(
            { _id: groupId, user: req.userId },
            { $push: { tasks: task } },
            { new: true }
        );
        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена"
            });
        }
        let lastIndex = group.tasks.length - 1;
        res.json(group.tasks[lastIndex]);
    } catch (error) {
        console.log(error);
        handleError(res, "Не вдалося створити завдання");
    }
};

export const remove = async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const taskId = req.params.taskId;
      const group = await GroupModel.findOneAndUpdate(
        { _id: groupId, user: req.userId },
        { $pull: { tasks: { _id: taskId } } },
        { new: true }
      );
      if (!group) {
        return res.status(404).json({
          message: "Група не знайдена"
        });
      }
      res.json(group.tasks);
    } catch (error) {
      console.log(error);
        handleError(res, "Не вдалося видалити завдання");
    }
  };

export const update = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const taskId = req.params.taskId;
        const group = await GroupModel.findByIdAndUpdate(
            groupId,
            { $set: { "tasks.$[elem]": { ...req.body, _id: taskId } } },
            { new: true, arrayFilters: [{ "elem._id": taskId }], runValidators: true }
          );
          if (!group) {
            return res.status(404).json({
              message: "Група не знайдена"
            });
          }
          res.json(group.tasks);
    } catch (error) {
        console.log(error);
        handleError(res, "Не вдалося оновити завдання");
    }
};