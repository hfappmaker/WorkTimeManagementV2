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

// 型変換
export type TransformTypes<T, Transformations extends [any, any][]> = {
  [K in keyof T]: Transformations extends [infer First, ...infer Rest]
    ? First extends [infer From, infer To]
      ? From extends T[K]
        ? T[K] extends ((infer U extends Exclude<T[K], From>) | From)
          ? U | To
          : never
        : TransformTypes<
            { [P in K]: T[K] },
            Rest extends [any, any][] ? Rest : []
          >[K]
      : TransformTypes<
          { [P in K]: T[K] },
          Rest extends [any, any][] ? Rest : []
        >[K]
    : T[K];
};

// プロパティ名の変更
export type RenameProperties<
  T,
  RenameMap extends { [K in keyof T]?: string }
> = {
  [K in keyof T as K extends keyof RenameMap
    ? NonNullable<RenameMap[K]>
    : K]: T[K];
};

export type DecimalToNumber<T> = TransformTypes<T, [[Decimal, number]]>;

export type NullableToUndefined<T> = TransformTypes<T, [[null, undefined]]>;

export type TransformType<T, From, To> = TransformTypes<T, [[From, To]]>;

export type RenameProperty<
  T,
  OldKey extends keyof T & string,
  NewKey extends string
> = Omit<T, OldKey> & { [K in NewKey]: T[OldKey] };
