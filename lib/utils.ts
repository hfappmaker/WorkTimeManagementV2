import { Decimal } from "@prisma/client/runtime/library";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ヘルパー関数（必要に応じてファイルの先頭付近に定義して使い回せます）
export const truncate = (str: string, maxLength: number): string => {
  return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
};

// プロパティ名の変更
export type RenameProperty<
  T,
  OldKey extends keyof T & string,
  NewKey extends string
> = Omit<T, OldKey> & { [K in NewKey]: T[OldKey] };

// 複数のプロパティ名の変更
export type RenameProperties<
  T,
  RenameMap extends { [K in keyof T]?: string }
> = {
  [K in keyof T as K extends keyof RenameMap
    ? NonNullable<RenameMap[K]>
    : K]: T[K];
};

// 型変換
export type TransformType<T, From, To> = {
  [K in keyof T]: T[K] extends infer U
    ? U extends From
      ? To
      : U
    : never;
};

// 複数の型変換
export type TransformTypeMulti<T, Transformations extends [any, any][]> = {
  [K in keyof T]: T[K] extends infer U
    ? Transformations extends [infer First, ...infer Rest]
      ? First extends [infer From, infer To]
        ? U extends From
          ? TransformTypeMulti<{ [P in K]: To }, Rest extends [any, any][] ? Rest : []>[K]
          : TransformTypeMulti<{ [P in K]: U }, Rest extends [any, any][] ? Rest : []>[K]
        : TransformTypeMulti<{ [P in K]: U }, Rest extends [any, any][] ? Rest : []>[K]
      : U
    : never;
};

// nullをundefinedに変換
export type NullableToUndefined<T> = TransformType<T, null, undefined>;

// クライアントサイドで再利用可能な型変換
export type ClientSideDataTransform<T> = TransformTypeMulti<
  T,
  [[Decimal, number], [null, undefined]]
>;
