import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export async function validateRequest<T extends object>(
  cls: new () => T,
  plain: any
): Promise<{ valid: boolean; errors?: string[]; data?: T }> {
  const instance = plainToInstance(cls, plain);
  const errors: ValidationError[] = await validate(instance);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : []
    );
    return { valid: false, errors: errorMessages };
  }

  return { valid: true, data: instance };
}
