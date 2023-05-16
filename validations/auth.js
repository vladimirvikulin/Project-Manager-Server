import { body } from 'express-validator'

export const registerValidation = [
    body('email', 'Невірний формат пошти').isEmail(),
    body('password', 'Пароль повинен містити мінімум 5 символів').isLength({ min: 5 }),
    body('fullName', 'Не вказано імені').isLength({ min: 3 }),
];