export class BaseObject<T> {
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
