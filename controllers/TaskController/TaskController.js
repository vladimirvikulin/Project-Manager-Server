import GroupModel from '../../models/Group.js';
import handleError from '../../utils/handleError.js';

export const getAll = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const group = await GroupModel.findOne({
            _id: groupId,
            $or: [{ user: req.userId }, { members: req.userId }],
        }).populate('members', 'fullName email');

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена або ви не маєте доступу",
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

        const group = await GroupModel.findOne({
            _id: groupId,
            $or: [{ user: req.userId }, { members: req.userId }],
        });

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена або ви не маєте доступу",
            });
        }

        const isOwner = group.user.toString() === req.userId.toString();
        if (!isOwner) {
            const userPermissions = group.permissions.find(
                (perm) => perm.userId.toString() === req.userId.toString()
            );
            if (!userPermissions || !userPermissions.canAddTasks) {
                return res.status(403).json({
                    message: "У вас немає дозволу на додавання задач",
                });
            }
        }

        const groupUpdate = await GroupModel.findOneAndUpdate(
            { _id: groupId },
            {
                $push: {
                    tasks: {
                        title,
                        status: status !== undefined ? status : true,
                        priority: priority !== undefined ? priority : false,
                        dependencies: dependencies || [],
                        duration: duration || 1,
                        deadline: deadline || undefined,
                        createdAt: new Date(),
                    },
                },
            },
            { new: true, runValidators: true }
        );

        if (!groupUpdate) {
            return res.status(404).json({
                message: "Група не знайдена",
            });
        }

        const lastIndex = groupUpdate.tasks.length - 1;
        res.json(groupUpdate.tasks[lastIndex]);
    } catch (error) {
        console.log(error);
        handleError(res, "Не вдалося створити завдання");
    }
};

export const remove = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const taskId = req.params.taskId;

        const group = await GroupModel.findOne({
            _id: groupId,
            $or: [{ user: req.userId }, { members: req.userId }],
        });

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена або ви не маєте доступу",
            });
        }

        const isOwner = group.user.toString() === req.userId.toString();
        if (!isOwner) {
            const userPermissions = group.permissions.find(
                (perm) => perm.userId.toString() === req.userId.toString()
            );
            if (!userPermissions || !userPermissions.canDeleteTasks) {
                return res.status(403).json({
                    message: "У вас немає дозволу на видалення задач",
                });
            }
        }

        const groupUpdate = await GroupModel.findOneAndUpdate(
            { _id: groupId },
            { $pull: { tasks: { _id: taskId } } },
            { new: true }
        );

        if (!groupUpdate) {
            return res.status(404).json({
                message: "Група не знайдена",
            });
        }

        await GroupModel.updateMany(
            { _id: groupId, "tasks.dependencies": taskId },
            { $pull: { "tasks.$[].dependencies": taskId } }
        );

        const updatedGroup = await GroupModel.findById(groupId)
            .populate('members', 'fullName email');

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

        const group = await GroupModel.findOne({
            _id: groupId,
            $or: [{ user: req.userId }, { members: req.userId }],
        });

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена або ви не маєте доступу",
            });
        }

        const isOwner = group.user.toString() === req.userId.toString();
        if (!isOwner) {
            const userPermissions = group.permissions.find(
                (perm) => perm.userId.toString() === req.userId.toString()
            );
            if (!userPermissions || !userPermissions.canEditTasks) {
                return res.status(403).json({
                    message: "У вас немає дозволу на редагування задач",
                });
            }
        }

        const groupUpdate = await GroupModel.findOneAndUpdate(
            { _id: groupId },
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
                    },
                },
            },
            {
                new: true,
                arrayFilters: [{ "elem._id": taskId }],
                runValidators: true,
            }
        );

        if (!groupUpdate) {
            return res.status(404).json({
                message: "Група не знайдена",
            });
        }

        const updatedGroup = await GroupModel.findById(groupId)
            .populate('members', 'fullName email');

        res.json(updatedGroup.tasks);
    } catch (error) {
        console.log(error);
        handleError(res, "Не вдалося оновити завдання");
    }
};