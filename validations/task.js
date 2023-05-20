import { body } from 'express-validator'

export const taskValidation = [
    body('title', 'Введіть назву завдання').isLength({ min: 2 }).isString(),
    body('status', 'Невірний формат статусу').isBoolean(),
    body('priority', 'Невірний формат пріорітету').isBoolean(),
];