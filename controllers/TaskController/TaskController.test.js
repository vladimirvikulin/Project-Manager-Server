import GroupModel from '../../models/Group.js';
import {
  getAll,
  create,
  remove,
  update,
} from './TaskController.js';
import handleError from '../../utils/handleError.js';

jest.mock('../../models/Group.js', () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

jest.mock('../../utils/handleError.js', () => jest.fn());

describe('getAll', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        groupId: 'group-id',
      },
      userId: 'user-id',
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should return group tasks when found', async () => {
    const foundGroup = {
      tasks: ['task1', 'task2'],
    };
    GroupModel.findOne.mockResolvedValue(foundGroup);

    await getAll(req, res);

    expect(GroupModel.findOne).toHaveBeenCalledWith({
      _id: req.params.groupId,
      user: req.userId,
    });
    expect(res.json).toHaveBeenCalledWith(foundGroup.tasks);
  });

  it('should return 404 status and message when the group is not found', async () => {
    GroupModel.findOne.mockResolvedValue(null);

    await getAll(req, res);

    expect(GroupModel.findOne).toHaveBeenCalledWith({
      _id: req.params.groupId,
      user: req.userId,
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Група не знайдена' });
  });

  it('should call handleError when an error occurs', async () => {
    GroupModel.findOne.mockRejectedValue(new Error('Не вдалося отримати завдання'));
    await getAll(req, res);

    expect(GroupModel.findOne).toHaveBeenCalledWith({
      _id: req.params.groupId,
      user: req.userId,
    });
    expect(handleError).toHaveBeenCalledWith(res, 'Не вдалося отримати завдання');
  });
});

describe('create', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        groupId: 'group-id',
      },
      body: {
        title: 'Task Title',
        completed: false,
      },
      userId: 'user-id',
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should create and return the task', async () => {
    const createdTask = 'task';
    const updatedGroup = {
      tasks: [createdTask],
    };
    GroupModel.findOneAndUpdate.mockResolvedValue(updatedGroup);

    await create(req, res);

    expect(GroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.groupId,
        user: req.userId,
      },
      { $push: { tasks: req.body } },
      { new: true }
    );
    expect(res.json).toHaveBeenCalledWith(createdTask);
  });

  it('should return 404 status and message when the group is not found', async () => {
    GroupModel.findOneAndUpdate.mockResolvedValue(null);

    await create(req, res);

    expect(GroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.groupId,
        user: req.userId,
      },
      { $push: { tasks: req.body } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Група не знайдена' });
  });

  it('should call handleError when an error occurs', async () => {
    GroupModel.findOneAndUpdate.mockRejectedValue(new Error('Не вдалося створити завдання'));
    await create(req, res);

    expect(GroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.groupId,
        user: req.userId,
      },
      { $push: { tasks: req.body } },
      { new: true }
    );
    expect(handleError).toHaveBeenCalledWith(res, 'Не вдалося створити завдання');
  });
});

describe('remove', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        groupId: 'group-id',
        taskId: 'task-id',
      },
      userId: 'user-id',
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should remove the task and return group tasks', async () => {
    const updatedGroup = {
      tasks: ['task1', 'task2'],
    };
    GroupModel.findOneAndUpdate.mockResolvedValue(updatedGroup);

    await remove(req, res);

    expect(GroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.groupId,
        user: req.userId,
      },
      { $pull: { tasks: { _id: req.params.taskId } } },
      { new: true }
    );
    expect(res.json).toHaveBeenCalledWith(updatedGroup.tasks);
  });

  it('should return 404 status and message when the group is not found', async () => {
    GroupModel.findOneAndUpdate.mockResolvedValue(null);

    await remove(req, res);

    expect(GroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.groupId,
        user: req.userId,
      },
      { $pull: { tasks: { _id: req.params.taskId } } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Група не знайдена' });
  });

  it('should call handleError when an error occurs', async () => {
    GroupModel.findOneAndUpdate.mockRejectedValue(new Error('Не вдалося видалити завдання'));
    await remove(req, res);

    expect(GroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.groupId,
        user: req.userId,
      },
      { $pull: { tasks: { _id: req.params.taskId } } },
      { new: true }
    );
    expect(handleError).toHaveBeenCalledWith(res, 'Не вдалося видалити завдання');
  });
});

describe('update', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        groupId: 'group-id',
        taskId: 'task-id',
      },
      body: {
        title: 'Updated Task Title',
        completed: true,
      },
      userId: 'user-id',
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should update the task and return group tasks', async () => {
    const updatedGroup = {
      tasks: ['task1', 'task2'],
    };
    GroupModel.findByIdAndUpdate.mockResolvedValue(updatedGroup);

    await update(req, res);

    expect(GroupModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.groupId,
      { $set: { 'tasks.$[elem]': { ...req.body, _id: req.params.taskId } } },
      { new: true, arrayFilters: [{ 'elem._id': req.params.taskId }], runValidators: true }
    );
    expect(res.json).toHaveBeenCalledWith(updatedGroup.tasks);
  });

  it('should return 404 status and message when the group is not found', async () => {
    GroupModel.findByIdAndUpdate.mockResolvedValue(null);

    await update(req, res);

    expect(GroupModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.groupId,
      { $set: { 'tasks.$[elem]': { ...req.body, _id: req.params.taskId } } },
      { new: true, arrayFilters: [{ 'elem._id': req.params.taskId }], runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Група не знайдена' });
  });

  it('should call handleError when an error occurs', async () => {
    GroupModel.findByIdAndUpdate.mockRejectedValue(new Error('Не вдалося оновити завдання'));
    await update(req, res);

    expect(GroupModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.groupId,
      { $set: { 'tasks.$[elem]': { ...req.body, _id: req.params.taskId } } },
      { new: true, arrayFilters: [{ 'elem._id': req.params.taskId }], runValidators: true }
    );
    expect(handleError).toHaveBeenCalledWith(res, 'Не вдалося оновити завдання');
  });
});
