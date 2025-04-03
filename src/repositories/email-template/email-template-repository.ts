import { db } from "@/lib/db";
import { isValidTemplateString } from "@/utils/string/template-parser";

export class EmailTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailTemplateError";
  }
}

export class EmailTemplateRepository {
  /**
   * ユーザーIDに紐づくメールテンプレート一覧を取得
   */
  async getByCreateUserId(createUserId: string) {
    return await db.emailTemplate.findMany({
      where: { createUserId },
    });
  }

  /**
   * IDでメールテンプレートを取得
   */
  async getById(id: string) {
    return await db.emailTemplate.findUnique({
      where: { id },
    });
  }

  /**
   * メールテンプレートを作成
   */
  async create(data: {
    name: string;
    subject: string;
    body: string;
    createUserId: string;
  }) {
    // テンプレートの検証
    if (!isValidTemplateString(data.subject)) {
      throw new EmailTemplateError("件名のテンプレート形式が不正です");
    }
    if (!isValidTemplateString(data.body)) {
      throw new EmailTemplateError("本文のテンプレート形式が不正です");
    }

    return await db.emailTemplate.create({
      data,
    });
  }

  /**
   * メールテンプレートを更新
   */
  async update(
    id: string,
    data: { name?: string; subject?: string; body?: string },
  ) {
    // テンプレートの検証
    if (data.subject && !isValidTemplateString(data.subject)) {
      throw new EmailTemplateError("件名のテンプレート形式が不正です");
    }
    if (data.body && !isValidTemplateString(data.body)) {
      throw new EmailTemplateError("本文のテンプレート形式が不正です");
    }

    return await db.emailTemplate.update({
      where: { id },
      data,
    });
  }

  /**
   * メールテンプレートを削除
   */
  async delete(id: string) {
    return await db.emailTemplate.delete({
      where: { id },
    });
  }
}
