import { validationResult } from 'express-validator';
import GroupModel from '../models/Group.js'

export const create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }
        const { title, tasks, completed, notCompleted } = req.body;
        const doc = new GroupModel({
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
        res.status(500).json({
            message: 'Не вдалося створити групу',
        })
    }
}