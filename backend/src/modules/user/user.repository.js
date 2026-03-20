import User from "./user.model.js";

export class UserRepository {
  findByEmail(email) {
    return User.findOne({ email });
  }

  findById(id) {
    return User.findById({ id });
  }

  create(data) {
    return User.create(data);
  }
}
