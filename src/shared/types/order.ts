export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type OrderQuery<T> = {
  [key in keyof T]?: object | OrderDirection;
};
