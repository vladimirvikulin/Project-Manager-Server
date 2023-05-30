import GroupModel from '../models/Group.js'
import handleError  from '../utils/handleError.js';

export const getAll = async (req, res) => {
    try {
        const groups = await GroupModel.find({ user: req.userId });
        res.json(groups);
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося отримати групу');
    }
}

export const getOne = async (req, res) => {
    try {
        const groupId = req.params.id;
        const group = await GroupModel.findOne({
            _id: groupId,
            user: req.userId
        });

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена"
            });
        }

        res.json(group);
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося отримати групу');
    }
}

export const create = async (req, res) => {
    try {
        const { title, tasks, completed, notCompleted } = req.body;
        const doc = await GroupModel.create({
            title,
            tasks,
            completed,
            notCompleted,
            user: req.userId,
        });
        const group = await doc.save();
        res.json(group);
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося створити групу');
    }
}

export const remove = async (req, res) => {
    try {
        const groupId = req.params.id;
        const group = await GroupModel.findOneAndDelete({
            _id: groupId,
            user: req.userId
        });     

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена"
            });
        }
        
        res.json(group);
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося видалити групу');
    }
}

export const update = async (req, res) => {
    try {
        const { title, tasks, completed, notCompleted } = req.body;
        const groupId = req.params.id;

        const updatedGroup = await GroupModel.findOneAndUpdate(
            {
                _id: groupId,
                user: req.userId
            },
            {
                title,
                tasks,
                completed,
                notCompleted,
                user: req.userId,
            },
            {
                returnDocument: 'after',
            }
        );

        if (!updatedGroup) {
            return res.status(404).json({
                message: "Група не знайдена"
            });
        }
        res.json(updatedGroup);

    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося оновити групу');
    }
}