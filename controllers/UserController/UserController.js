import UserModel from '../../models/User.js';
import GroupModel from '../../models/Group.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/generateToken/generateToken.js';

export const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        const doc = new UserModel({
            fullName,
            email,
            passwordHash: hash,
            pendingInvitations: [],
        });

        const user = await doc.save();
        const token = generateToken(user);

        const { passwordHash, ...userData } = user._doc;
        res.json({
            ...userData,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Не вдалося зареєструватися',
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Невірний логін або пароль'
            });
        }
        const isValidPass = await bcrypt.compare(password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Невірний логін або пароль'
            });
        }
        const token = generateToken(user);

        const { passwordHash, ...userData } = user._doc;
        res.json({
            ...userData,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Не вдалося авторизуватися',
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
            .populate('pendingInvitations.groupId', 'title')
            .populate('pendingInvitations.invitedBy', 'fullName email');
        if (!user) {
            return res.status(404).json({
                message: 'Невірний логін або пароль',
            });
        }
        const { passwordHash, ...userData } = user._doc;
        res.json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Нема доступу',
        });
    }
};

export const manageInvitation = async (req, res) => {
    try {
        const { groupId, action } = req.body;
        const userId = req.userId;

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({
                message: "Невірна дія. Використовуйте 'accept' або 'decline'",
            });
        }

        const user = await UserModel.findById(userId);
        const invitation = user.pendingInvitations.find(
            invite => invite.groupId.toString() === groupId && invite.status === 'pending'
        );

        if (!invitation) {
            return res.status(404).json({
                message: "Запрошення не знайдено або вже оброблено",
            });
        }

        invitation.status = action === 'accept' ? 'accepted' : 'declined';
        await user.save();

        const group = await GroupModel.findById(groupId);
        const groupInvitation = group.invitedUsers.find(
            invite => invite.userId.toString() === userId.toString()
        );

        if (!groupInvitation) {
            return res.status(404).json({
                message: "Запрошення не знайдено в групі",
            });
        }

        groupInvitation.status = action === 'accept' ? 'accepted' : 'declined';

        if (action === 'accept') {
            if (!group.members.includes(userId)) {
                group.members.push(userId);
            }
        }

        await group.save();

        const updatedGroup = await GroupModel.findById(groupId)
            .populate('members', 'fullName email')
            .populate('user', 'fullName email');

        res.json({
            message: `Запрошення ${action === 'accept' ? 'прийнято' : 'відхилено'}`,
            group: updatedGroup,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Не вдалося обробити запрошення',
        });
    }
};