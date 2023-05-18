import { body } from 'express-validator'

export const groupCreateValidation = [
    body('title', 'Введіть назву групи').isLength({ min: 2 }).isString(),
    body('tasks', 'Невірний формат завдань, вкажіть массив').isArray(),
    body('completed', 'Не вказано кількість виконаних завдань').isNumeric(),
    body('notCompleted', 'Не вказано кількість виконаних завдань').isNumeric(),
];