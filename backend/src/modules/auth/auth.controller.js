// auth.controller.js
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res, next) => {
    try {
      const result = await this.authService.register(req.body);
      // Coderabbit fixed
      res.json(result); // done
      res.status(201).json({ user: safeUser, token: result.token });
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authService.login(req.body);
      // Coderabbit fixed
      res.json(result); // done
    } catch (err) {
      next(err);
    }
  };
}
