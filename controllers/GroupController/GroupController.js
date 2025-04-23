import GroupModel from '../../models/Group.js';
import UserModel from '../../models/User.js';
import handleError from '../../utils/handleError.js';

export const getAll = async (req, res) => {
    try {
        const groups = await GroupModel.find({
            $or: [
                { user: req.userId },
                { 'members': req.userId },
            ],
        }).populate('members', 'fullName email');
        res.json(groups);
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося отримати групи');
    }
};

export const getOne = async (req, res) => {
    try {
        const groupId = req.params.id;
        const group = await GroupModel.findOne({
            _id: groupId,
            $or: [
                { user: req.userId },
                { 'members': req.userId },
            ],
        }).populate('members', 'fullName email');

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена або ви не маєте доступу",
            });
        }

        res.json(group);
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося отримати групу');
    }
};

export const create = async (req, res) => {
    try {
        const { title, tasks, executorCount } = req.body;
        const doc = new GroupModel({
            title,
            tasks,
            executorCount: executorCount || 2,
            user: req.userId,
            members: [req.userId], 
            invitedUsers: [],
        });
        const group = await doc.save();
        
        const populatedGroup = await GroupModel.findById(group._id)
            .populate('members', 'fullName email')
            .populate('user', 'fullName email');
        
        res.json(populatedGroup);
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося створити групу');
    }
};

export const remove = async (req, res) => {
    try {
        const groupId = req.params.id;
        const group = await GroupModel.findOne({
            _id: groupId,
            user: req.userId,
        });

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена або ви не власник",
            });
        }

        await UserModel.updateMany(
            { 'pendingInvitations.groupId': groupId },
            { $pull: { pendingInvitations: { groupId } } }
        );

        await group.deleteOne();
        res.json({ message: 'Група успішно видалена' });
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося видалити групу');
    }
};

export const update = async (req, res) => {
    try {
        const { title, tasks, executorCount } = req.body;
        const groupId = req.params.id;

        const updatedGroup = await GroupModel.findOneAndUpdate(
            {
                _id: groupId,
                user: req.userId,
            },
            {
                title,
                tasks,
                executorCount,
            },
            {
                returnDocument: 'after',
            }
        ).populate('members', 'fullName email');

        if (!updatedGroup) {
            return res.status(404).json({
                message: "Група не знайдена або ви не власник",
            });
        }

        res.json(updatedGroup);
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося оновити групу');
    }
};

export const inviteUser = async (req, res) => {
    try {
        const { email } = req.body;
        const groupId = req.params.id;

        const group = await GroupModel.findOne({
            _id: groupId,
            user: req.userId,
        });

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена або ви не власник",
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "Користувач із такою електронною адресою не знайдений",
            });
        }

        if (user._id.toString() === req.userId.toString()) {
            return res.status(400).json({
                message: "Ви не можете запросити самого себе",
            });
        }

        if (group.members.includes(user._id)) {
            return res.status(400).json({
                message: "Користувач уже є учасником групи",
            });
        }

        const existingPendingInvitation = group.invitedUsers.find(
            (invite) => invite.userId.toString() === user._id.toString() && invite.status === 'pending'
        );
        if (existingPendingInvitation) {
            return res.status(400).json({
                message: "Запрошення вже надіслано цьому користувачу",
            });
        }

        group.invitedUsers = group.invitedUsers.filter(
            (invite) => invite.userId.toString() !== user._id.toString() || invite.status !== 'declined'
        );

        group.invitedUsers.push({
            userId: user._id,
            status: 'pending',
            invitedAt: new Date(),
        });
        await group.save();

        await UserModel.updateOne(
            { _id: user._id },
            { $pull: { pendingInvitations: { groupId, status: 'declined' } } }
        );

        await UserModel.updateOne(
            { _id: user._id },
            {
                $push: {
                    pendingInvitations: {
                        groupId,
                        status: 'pending',
                        invitedBy: req.userId,
                        invitedAt: new Date(),
                    },
                },
            }
        );

        const updatedGroup = await GroupModel.findById(groupId)
            .populate('members', 'fullName email')
            .populate('user', 'fullName email');

        res.json({
            message: `Запрошення надіслано користувачу ${user.fullName}`,
            group: updatedGroup,
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося надіслати запрошення');
    }
};

export const removeUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const groupId = req.params.id;

        const group = await GroupModel.findOne({
            _id: groupId,
            $or: [
                { user: req.userId },
                { members: req.userId },
            ],
        });

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена або ви не маєте доступу",
            });
        }

        if (!group.members.includes(userId)) {
            return res.status(400).json({
                message: "Цей користувач не є учасником групи",
            });
        }

        const isOwner = group.user.toString() === req.userId.toString();

        const isRemovingSelf = userId.toString() === req.userId.toString();

        if (!isRemovingSelf && !isOwner) {
            return res.status(403).json({
                message: "Ви можете видалити лише себе з групи, якщо ви не власник",
            });
        }

        if (isRemovingSelf && isOwner) {
            return res.status(400).json({
                message: "Власник не може вийти з групи через цю дію. Видаліть групу, якщо хочете її покинути",
            });
        }

        group.members = group.members.filter(memberId => memberId.toString() !== userId.toString());
        group.invitedUsers = group.invitedUsers.filter(
            invite => invite.userId.toString() !== userId.toString()
        );
        group.permissions = group.permissions.filter(
            perm => perm.userId.toString() !== userId.toString()
        );
        await group.save();

        await UserModel.updateOne(
            { _id: userId },
            { $pull: { pendingInvitations: { groupId } } }
        );

        const updatedGroup = await GroupModel.findById(groupId)
            .populate('members', 'fullName email')
            .populate('user', 'fullName email');

        res.json({
            message: isRemovingSelf ? 'Ви успішно вийшли з групи' : 'Користувача видалено з групи',
            group: updatedGroup,
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося видалити користувача');
    }
};

export const updatePermissions = async (req, res) => {
    try {
        const groupId = req.params.id;
        const { userId, canAddTasks = false, canEditTasks = false, canDeleteTasks = false } = req.body;

        const group = await GroupModel.findOne({
            _id: groupId,
            user: req.userId,
        });

        if (!group) {
            return res.status(404).json({
                message: "Група не знайдена або ви не власник",
            });
        }

        if (!group.members.includes(userId)) {
            return res.status(400).json({
                message: "Цей користувач не є учасником групи",
            });
        }

        if (userId.toString() === req.userId.toString()) {
            return res.status(400).json({
                message: "Ви не можете змінювати дозволи для самого себе",
            });
        }

        const permissionIndex = group.permissions.findIndex(
            (perm) => perm.userId.toString() === userId.toString()
        );

        if (permissionIndex !== -1) {
            group.permissions[permissionIndex] = {
                userId,
                canAddTasks,
                canEditTasks,
                canDeleteTasks,
            };
        } else {
            group.permissions.push({
                userId,
                canAddTasks,
                canEditTasks,
                canDeleteTasks,
            });
        }

        await group.save();

        const updatedGroup = await GroupModel.findById(groupId)
            .populate('members', 'fullName email')
            .populate('user', 'fullName email');

        res.json(updatedGroup);
    } catch (error) {
        console.log(error);
        handleError(res, 'Не вдалося оновити дозволи');
    }
};