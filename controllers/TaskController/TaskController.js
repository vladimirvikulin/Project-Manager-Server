import GroupModel from '../../models/Group.js';
import handleError from '../../utils/handleError.js';

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
        const { title, status, priority, dependencies, duration, deadline } = req.body;

        const group = await GroupModel.findOneAndUpdate(
            { _id: groupId, user: req.userId },
            { 
                $push: { 
                    tasks: { 
                        title, 
                        status, 
                        priority, 
                        dependencies: dependencies || [],
                        duration: duration || 1,
                        deadline: deadline || undefined,
                        createdAt: new Date(),
                    } 
                } 
            },
            { new: true, runValidators: true }
        );

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена"
            });
        }

        const lastIndex = group.tasks.length - 1;
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

        await GroupModel.updateMany(
            { _id: groupId, "tasks.dependencies": taskId },
            { $pull: { "tasks.$[].dependencies": taskId } }
        );

        const updatedGroup = await GroupModel.findById(groupId);

        res.json(updatedGroup.tasks);
    } catch (error) {
        console.log(error);
        handleError(res, "Не вдалося видалити завдання");
    }
};

export const update = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const taskId = req.params.taskId;
        const { title, status, priority, dependencies, duration, deadline } = req.body;

        const group = await GroupModel.findOneAndUpdate(
            { _id: groupId, user: req.userId },
            { 
                $set: { 
                    "tasks.$[elem]": { 
                        _id: taskId, 
                        title, 
                        status, 
                        priority, 
                        dependencies: dependencies || [],
                        duration: duration || 1,
                        deadline: deadline || undefined,
                    } 
                } 
            },
            { 
                new: true, 
                arrayFilters: [{ "elem._id": taskId }], 
                runValidators: true 
            }
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