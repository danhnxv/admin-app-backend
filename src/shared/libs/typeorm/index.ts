import { PaginationQuery, PaginationResponse } from '@shared/types/pagination';
import {
  Brackets,
  FindOneOptions,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

declare module 'typeorm' {
  interface Repository<Entity> {
    findAndPaginate(
      findManyPaginateOptions: FindManyPaginateOptions<Entity>,
    ): Promise<PaginationResponse<Entity>>;
  }

  interface FindManyPaginateOptions<Entity> extends FindOneOptions<Entity> {
    page?: number;
    pageSize?: number;
  }

  interface SelectQueryBuilder<Entity> {
    if(
      condition: boolean,
      func: (qb: SelectQueryBuilder<Entity>) => SelectQueryBuilder<Entity>,
    ): SelectQueryBuilder<Entity>;

    paginate(
      paginationQuery: PaginationQuery,
      paginationType?: 'offset' | 'skip',
    ): Promise<PaginationResponse<Entity>>;

    qbOrderBy(orderBy: object): SelectQueryBuilder<Entity>;

    fromUnion(
      queries: SelectQueryBuilder<Entity>[],
    ): SelectQueryBuilder<Entity>;

    where(
      where:
        | Brackets
        | string
        | ((qb: this) => string)
        | ObjectLiteral
        | ObjectLiteral[],
      parameters?: ObjectLiteral,
    ): SelectQueryBuilder<Entity>;

    andWhere(
      where:
        | Brackets
        | string
        | ((qb: this) => string)
        | ObjectLiteral
        | ObjectLiteral[],
      parameters?: ObjectLiteral,
    ): SelectQueryBuilder<Entity>;

    orWhere(
      where:
        | Brackets
        | string
        | ((qb: this) => string)
        | ObjectLiteral
        | ObjectLiteral[],
      parameters?: ObjectLiteral,
    ): SelectQueryBuilder<Entity>;
  }

  interface WhereExpressionBuilder {
    if(
      condition: boolean,
      func: (qb: WhereExpressionBuilder) => WhereExpressionBuilder,
    ): WhereExpressionBuilder;

    where(
      where:
        | Brackets
        | string
        | ((qb: SelectQueryBuilder<any>) => string)
        | ObjectLiteral
        | ObjectLiteral[],
      parameters?: ObjectLiteral,
    ): WhereExpressionBuilder;

    andWhere(
      where:
        | Brackets
        | string
        | ((qb: SelectQueryBuilder<any>) => string)
        | ObjectLiteral
        | ObjectLiteral[],
      parameters?: ObjectLiteral,
    ): WhereExpressionBuilder;

    orWhere(
      where:
        | Brackets
        | string
        | ((qb: SelectQueryBuilder<any>) => string)
        | ObjectLiteral
        | ObjectLiteral[],
      parameters?: ObjectLiteral,
    ): WhereExpressionBuilder;
  }
}

SelectQueryBuilder.prototype.if = function <Entity>(
  condition,
  func,
): SelectQueryBuilder<Entity> {
  if (condition) return func(this);

  return this;
};

SelectQueryBuilder.prototype.paginate = async function <Entity>(
  paginationQuery: PaginationQuery,
  paginationType: 'offset' | 'skip' = 'skip',
): Promise<PaginationResponse<Entity>> {
  const { page, pageSize } = paginationQuery;

  const offset = (page - 1) * pageSize;

  if (paginationType === 'offset') {
    const [nodes, total] = await this.offset(offset)
      .limit(pageSize)
      .getManyAndCount();

    return {
      page,
      pageSize,
      total,
      nodes,
    };
  }

  const [nodes, total] = await this.skip(offset)
    .take(pageSize)
    .getManyAndCount();

  return {
    page,
    pageSize,
    total,
    nodes,
  };
};

SelectQueryBuilder.prototype.qbOrderBy = function <Entity>(
  orderBy?: Record<string, any>,
): SelectQueryBuilder<Entity> {
  const processOrderBy = (
    order: Record<string, any>,
    parentKey: string = '',
  ) => {
    Object.entries(order).forEach(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nestedEntries = Object.entries(value);
        if (
          nestedEntries.length === 1 &&
          (nestedEntries[0][1] === 'ASC' || nestedEntries[0][1] === 'DESC')
        ) {
          const [nestedKey, direction] = nestedEntries[0];
          const fullKey = parentKey
            ? `${key}.${nestedKey}`
            : `${key}.${nestedKey}`;
          this.addOrderBy(fullKey, direction);
        } else {
          const fullKey = parentKey ? `${key}` : key;
          processOrderBy(value, fullKey);
        }
      } else {
        if (value === 'ASC' || value === 'DESC') {
          const fullKey = parentKey ? `${key}` : `${this.alias}.${key}`;
          this.addOrderBy(fullKey, value);
        }
      }
    });
  };

  if (orderBy) processOrderBy(orderBy);

  return this;
};

SelectQueryBuilder.prototype.fromUnion = function <Entity>(
  queries: SelectQueryBuilder<Entity>[],
): SelectQueryBuilder<Entity> {
  let sql: string;

  queries.forEach((query) => {
    // eslint-disable-next-line prefer-const
    let [sqlQuery, parameters] = query.getQueryAndParameters();

    parameters.forEach((parameter) => {
      if (typeof parameter === 'string') {
        sqlQuery = sqlQuery.replace('?', `"${parameter}"`);
      }
      if (typeof parameter === 'object') {
        if (Array.isArray(parameter)) {
          sqlQuery = sqlQuery.replace(
            '?',
            parameter
              .map((element) =>
                typeof element === 'string' ? `"${element}"` : element,
              )
              .join(','),
          );
        } else {
          sqlQuery = sqlQuery.replace('?', parameter);
        }
      }
      if (['number', 'boolean'].includes(typeof parameter)) {
        sqlQuery = sqlQuery.replace('?', parameter.toString());
      }
    });

    if (!sql) {
      sql = sqlQuery;
    } else {
      sql = `${sql} UNION ${sqlQuery}`;
    }
  });

  this.from(`(${sql})`, 'union');

  return this;
};

SelectQueryBuilder.prototype.where = function <Entity>(
  where:
    | Brackets
    | string
    | ((qb: SelectQueryBuilder<Entity>) => string)
    | ObjectLiteral
    | ObjectLiteral[],
  parameters?: ObjectLiteral,
): SelectQueryBuilder<Entity> {
  let expression: string;
  let newWhere = where;
  const [alias, column] = where.toString().split(' ')[0].split('.'); // temporary, need improve for cases that have multiple dots or using SQL functions
  const aliasData = this.expressionMap.aliases.find(
    (aliasItem) => aliasItem.name === alias,
  );

  if (aliasData) {
    const columnData = aliasData.metadata.columns.find(
      (columnItem) => columnItem.propertyName === column,
    );

    if (columnData && columnData.isVirtualProperty) {
      expression = columnData.query(alias);
      newWhere = (where as string).replace(
        `${alias}.${column}`,
        `(${expression})`,
      );
    }
  }

  this.expressionMap.wheres = [];

  const condition = this.getWhereCondition(newWhere);

  if (condition) {
    this.expressionMap.wheres = [
      {
        type: 'simple',
        condition,
      },
    ];
  }

  if (parameters) {
    this.setParameters(parameters);
  }

  return this;
};

SelectQueryBuilder.prototype.andWhere = function <Entity>(
  where:
    | string
    | Brackets
    | ((qb: SelectQueryBuilder<Entity>) => string)
    | ObjectLiteral
    | ObjectLiteral[],
  parameters?: ObjectLiteral,
): SelectQueryBuilder<Entity> {
  let expression: string;
  let newWhere = where;
  const [alias, column] = where.toString().split(' ')[0].split('.'); // temporary, need improve for cases that have multiple dots or using SQL functions
  const aliasData = this.expressionMap.aliases.find(
    (aliasItem) => aliasItem.name === alias,
  );

  if (aliasData) {
    const columnData = aliasData.metadata.columns.find(
      (columnItem) => columnItem.propertyName === column,
    );

    // Only for virtual column
    if (columnData && columnData.isVirtualProperty) {
      expression = columnData.query(alias);
      newWhere = (where as string).replace(
        `${alias}.${column}`,
        `(${expression})`,
      );
    }
  }

  // const colMeta = this.expressionMap.aliases // Get alias entity from here
  // console.log('🚀 ~ where:', where); // split by dot (.) to get alias
  // console.log(
  //   '🚀 ~ expressionMap:',
  //   colMeta.query ? colMeta.query('abc') : "Can't run", // Get virtual col query expression from here
  // );
  /**
   * DONE: Fill query to virtual column place to make it able to where by virtual column
   * TODO: Improve to make it able to where by virtual column with multiple dots or using SQL functions or other cases
   */
  this.expressionMap.wheres.push({
    type: 'and',
    condition: this.getWhereCondition(newWhere),
  });
  if (parameters) this.setParameters(parameters);
  return this;
};

SelectQueryBuilder.prototype.orWhere = function <Entity>(
  where:
    | Brackets
    | string
    | ((qb: SelectQueryBuilder<Entity>) => string)
    | ObjectLiteral
    | ObjectLiteral[],
  parameters?: ObjectLiteral,
): SelectQueryBuilder<Entity> {
  let expression: string;
  let newWhere = where;
  const [alias, column] = where.toString().split(' ')[0].split('.'); // temporary, need improve for cases that have multiple dots or using SQL functions
  const aliasData = this.expressionMap.aliases.find(
    (aliasItem) => aliasItem.name === alias,
  );

  if (aliasData) {
    const columnData = aliasData.metadata.columns.find(
      (columnItem) => columnItem.propertyName === column,
    );

    if (columnData && columnData.isVirtualProperty) {
      expression = columnData.query(alias);
      newWhere = (where as string).replace(
        `${alias}.${column}`,
        `(${expression})`,
      );
    }
  }

  this.expressionMap.wheres.push({
    type: 'or',
    condition: this.getWhereCondition(newWhere),
  });
  if (parameters) this.setParameters(parameters);
  return this;
};
