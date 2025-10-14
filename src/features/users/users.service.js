const usersRepository = require('./users.repository');

class UsersService {
  getAll() {
    return usersRepository.getAll();
  }

  create({ name, email }) {
    if (!name || !email) {
      throw new Error('Name and email are required');
    }
    return usersRepository.create({ name, email });
  }
}

module.exports = new UsersService();
