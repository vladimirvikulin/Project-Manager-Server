import { body } from 'express-validator'

export const taskValidation = [
    body('title', 'Введіть назву завдання').isLength({ min: 2 }).isString(),
    body('status', 'Невірний формат статусу').isBoolean(),
    body('priority', 'Невірний формат пріорітету').isBoolean(),
    body('dependencies', 'Залежності мають бути масивом ID').optional().isArray(),
    body('dependencies.*', 'Кожен елемент залежностей має бути валідним ObjectId').optional().isMongoId(),
];