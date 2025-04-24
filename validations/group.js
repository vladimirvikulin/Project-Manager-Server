import { body } from 'express-validator'

export const groupCreateValidation = [
    body('title', 'Enter the group title').isLength({ min: 2 }).isString(),
    body('tasks', 'Tasks must be an array').isArray(),
];