const usersService = require('./users.service');

class UsersController {
  async getAll(req, res) {
    try {
      const users = await usersService.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const user = await usersService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new UsersController();
