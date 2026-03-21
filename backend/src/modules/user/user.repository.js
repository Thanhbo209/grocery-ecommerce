import User from "./user.model.js";

export class UserRepository {
  findByEmail(email) {
    return User.findOne({ email }).select("+password");
  }

  findById(id) {
    return User.findById(id);
  }

  create(data) {
    return User.create(data);
  }
}
