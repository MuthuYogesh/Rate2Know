// middleware/validate.mjs
import { validationResult } from 'express-validator';

function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(e => ({ param: e.param, msg: e.msg })) });
    }
    next();
}

export default handleValidation;
