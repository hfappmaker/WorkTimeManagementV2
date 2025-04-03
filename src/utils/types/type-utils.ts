// プロパティ名の変更
export type RenameProperty<
  T,
  OldKey extends keyof T,
  NewKey extends string,
> = Omit<T, OldKey> & Record<NewKey, T[OldKey]>;

// 複数のプロパティ名の変更
export type RenameProperties<
  T,
  RenameMap extends { [K in keyof T]?: string },
> = {
  [K in keyof T as K extends keyof RenameMap
    ? NonNullable<RenameMap[K]>
    : K]: T[K];
};

/**
 * オブジェクトの型を変換する型ユーティリティ
 * @example
 * type Result = TransformType<{
 *   price: Decimal | null;
 *   nested: { amount: Decimal }
 * }, Decimal, number>;
 * // Result = {
 * //   price: number | null;
 * //   nested: { amount: Decimal }
 * // }
 */
export type TransformType<T, From, To> = {
  [K in keyof T]: T[K] extends infer U ? (U extends From ? To : U) : never;
};

/**
 * 複数の型変換を適用する型ユーティリティ
 * @example
 * type Result = TransformTypeMulti<{
 *   price: Decimal | null;
 *   nested: { amount: Decimal }
 * }, [[Decimal, number], [null, undefined]]>;
 * // Result = {
 * //   price: number | undefined;
 * //   nested: { amount: Decimal }
 * // }
 */
export type TransformTypeMulti<
  T,
  Transformations extends [unknown, unknown][],
> = {
  [K in keyof T]: T[K] extends infer U
    ? Transformations extends [infer First, ...infer Rest]
      ? First extends [infer From, infer To]
        ? U extends From
          ? TransformTypeMulti<
              Record<K, To>,
              Rest extends [unknown, unknown][] ? Rest : []
            >[K]
          : TransformTypeMulti<
              Record<K, U>,
              Rest extends [unknown, unknown][] ? Rest : []
            >[K]
        : TransformTypeMulti<
            Record<K, U>,
            Rest extends [unknown, unknown][] ? Rest : []
          >[K]
      : U
    : never;
};

// 深い入れ子のオブジェクトにも対応するユーティリティ型
export type DeepReadonlyWithoutSetters<T> = T extends (
  ...args: unknown[]
) => unknown
  ? T
  : T extends (infer U)[]
    ? readonly DeepReadonlyWithoutSetters<U>[]
    : T extends object
      ? {
          readonly [K in keyof T as K extends `set${string}`
            ? never
            : K]: DeepReadonlyWithoutSetters<T[K]>;
        }
      : T;
