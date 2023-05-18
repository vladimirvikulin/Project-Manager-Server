import { validationResult } from 'express-validator';
import GroupModel from '../models/Group.js'

export const getAll = async (req, res) => {
    try {
        const groups = await GroupModel.find().populate('user').exec();
        res.json(groups);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Не вдалося отримати групи',
        })
    }
}

export const getOne = async (req, res) => {
    try {
        const groupId = req.params.id;
        GroupModel.findOne({
            _id: groupId,
        }, (error, doc) => {
            if (error) {
                console.log(error);
                return res.status(500).json({
                    message: "Не вдалося повернути групу" 
                });
            }   
            if (!doc) {
                return res.status(404).json({
                    message: "Група не знайдена"
                });
            }
            res.json(doc);
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Не вдалося отримати групу',
        })
    }
}

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