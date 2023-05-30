import GroupModel from '../models/Group.js';
import {
  getAll,
  getOne,
  create,
  remove,
  update,
} from './GroupController.js';
import handleError from '../utils/handleError.js';

jest.mock('../models/Group.js', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../utils/handleError.js', () => jest.fn());

describe('getAll', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      userId: 'user-id',
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should return groups when found', async () => {
    const foundGroups = ['group1', 'group2'];
    GroupModel.find.mockResolvedValue(foundGroups);

    await getAll(req, res);

    expect(GroupModel.find).toHaveBeenCalledWith({ user: req.userId });
    expect(res.json).toHaveBeenCalledWith(foundGroups);
  });

  it('should call handleError when an error occurs', async () => {
    GroupModel.find.mockRejectedValue(new Error('Не вдалося отримати групу'));

    await getAll(req, res);

    expect(GroupModel.find).toHaveBeenCalledWith({ user: req.userId });
    expect(handleError).toHaveBeenCalledWith(res, 'Не вдалося отримати групу');
  });
});

describe('getOne', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        id: 'group-id',
      },
      userId: 'user-id',
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should return the group when found', async () => {
    const foundGroup = 'group';
    GroupModel.findOne.mockResolvedValue(foundGroup);

    await getOne(req, res);

    expect(GroupModel.findOne).toHaveBeenCalledWith({
      _id: req.params.id,
      user: req.userId,
    });
    expect(res.json).toHaveBeenCalledWith(foundGroup);
  });

  it('should return 404 status and message when the group is not found', async () => {
    GroupModel.findOne.mockResolvedValue(null);

    await getOne(req, res);

    expect(GroupModel.findOne).toHaveBeenCalledWith({
      _id: req.params.id,
      user: req.userId,
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Група не знайдена' });
  });

  it('should call handleError when an error occurs', async () => {
    GroupModel.findOne.mockRejectedValue(new Error('Не вдалося отримати групу'));
    await getOne(req, res);

    expect(GroupModel.findOne).toHaveBeenCalledWith({
      _id: req.params.id,
      user: req.userId,
    });
    expect(handleError).toHaveBeenCalledWith(res, 'Не вдалося отримати групу');
  });
});

describe('create', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        title: 'Group Title',
        tasks: [],
        completed: 0,
        notCompleted: 0,
      },
      userId: 'user-id',
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should create and return the group', async () => {
    const createdGroup = 'group';
    GroupModel.create.mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(createdGroup),
      }));

    await create(req, res);

    expect(GroupModel.create).toHaveBeenCalledWith({
      title: req.body.title,
      tasks: req.body.tasks,
      completed: req.body.completed,
      notCompleted: req.body.notCompleted,
      user: req.userId,
    });
    expect(res.json).toHaveBeenCalledWith(createdGroup);
  });

  it('should call handleError when an error occurs', async () => {
    GroupModel.create.mockRejectedValue(new Error('Не вдалося створити групу'));
    await create(req, res);

    expect(GroupModel.create).toHaveBeenCalledWith({
      title: req.body.title,
      tasks: req.body.tasks,
      completed: req.body.completed,
      notCompleted: req.body.notCompleted,
      user: req.userId,
    });
    expect(handleError).toHaveBeenCalledWith(res, 'Не вдалося створити групу');
  });
});

describe('remove', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        id: 'group-id',
      },
      userId: 'user-id',
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should remove and return the group when found', async () => {
    const removedGroup = 'group';
    GroupModel.findOneAndDelete.mockResolvedValue(removedGroup);

    await remove(req, res);

    expect(GroupModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: req.params.id,
      user: req.userId,
    });
    expect(res.json).toHaveBeenCalledWith(removedGroup);
  });

  it('should return 404 status and message when the group is not found', async () => {
    GroupModel.findOneAndDelete.mockResolvedValue(null);

    await remove(req, res);

    expect(GroupModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: req.params.id,
      user: req.userId,
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Група не знайдена' });
  });

  it('should call handleError when an error occurs', async () => {
    GroupModel.findOneAndDelete.mockRejectedValue(new Error('Не вдалося видалити групу'));
    await remove(req, res);

    expect(GroupModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: req.params.id,
      user: req.userId,
    });
    expect(handleError).toHaveBeenCalledWith(res, 'Не вдалося видалити групу');
  });
});

describe('update', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        id: 'group-id',
      },
      body: {
        title: 'Updated Title',
        tasks: [],
        completed: 0,
        notCompleted: 0,
      },
      userId: 'user-id',
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should update and return the group when found', async () => {
    const updatedGroup = 'group';
    GroupModel.findOneAndUpdate.mockResolvedValue(updatedGroup);

    await update(req, res);

    expect(GroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        title: req.body.title,
        tasks: req.body.tasks,
        completed: req.body.completed,
        notCompleted: req.body.notCompleted,
        user: req.userId,
      },
      {
        returnDocument: 'after',
      }
    );
    expect(res.json).toHaveBeenCalledWith(updatedGroup);
  });

  it('should return 404 status and message when the group is not found', async () => {
    GroupModel.findOneAndUpdate.mockResolvedValue(null);

    await update(req, res);

    expect(GroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        title: req.body.title,
        tasks: req.body.tasks,
        completed: req.body.completed,
        notCompleted: req.body.notCompleted,
        user: req.userId,
      },
      {
        returnDocument: 'after',
      }
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Група не знайдена' });
  });

  it('should call handleError when an error occurs', async () => {
    GroupModel.findOneAndUpdate.mockRejectedValue(new Error('Не вдалося оновити групу'));
    await update(req, res);

    expect(GroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        title: req.body.title,
        tasks: req.body.tasks,
        completed: req.body.completed,
        notCompleted: req.body.notCompleted,
        user: req.userId,
      },
      {
        returnDocument: 'after',
      }
    );
    expect(handleError).toHaveBeenCalledWith(res, 'Не вдалося оновити групу');
  });
});
