// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

/** Run validation chains and return 422 if any fail */
export function validate(chains: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(chains.map(c => c.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error:   'Validation failed',
        details: errors.mapped(),
      });
    }
    next();
  };
}

/* ── Reusable rule sets ──────────────────────────────────────── */
export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase letter')
    .matches(/[0-9]/).withMessage('Must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Must contain a special character'),
  body('mobile').optional().isMobilePhone('en-IN').withMessage('Valid Indian mobile number required'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const publishRules = [
  body('targets').isArray({ min: 1 }).withMessage('At least one target platform required'),
  body('targets.*.socialAccountId').notEmpty().withMessage('socialAccountId required per target'),
];

export const otpRules = [
  body('mobile').isMobilePhone('en-IN').withMessage('Valid +91 mobile number required'),
];
