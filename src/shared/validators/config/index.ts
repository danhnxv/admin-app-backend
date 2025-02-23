import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync, ValidatorOptions } from 'class-validator';

export const validateObject = <T extends object>(
  obj: object,
  cls: ClassConstructor<T>,
  validateOptions?: ValidatorOptions,
) => {
  const validatedConfig = plainToInstance(cls, obj, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    ...validateOptions,
    whitelist: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};
