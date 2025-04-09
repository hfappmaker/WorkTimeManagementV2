import { test, expect } from '@playwright/test';

test('クライアント作成のテスト', async ({ page }) => {
    // クライアント一覧ページへ遷移
    await page.goto('http://localhost:3000/client');
    // クライアントが存在しない場合は「クライアントがありません」と表示されることを想定
    const emptyMessage = page.getByTestId('no-clients-message');
    await expect(emptyMessage).toBeVisible();

    // 「新規クライアント作成」ボタンをクリック
    await page.click('text=新規クライアント作成');

    // 作成ダイアログが表示されるまで待つ（ここではダイアログ内にフォームが存在する前提）
    const formLocator = page.locator('form'); // 適切なセレクターに置き換えてください
    await expect(formLocator).toBeVisible();

    // フォームに値を入力
    await page.fill('input[name="name"]', 'Test Client');
    await page.fill('input[name="contactName"]', 'John Doe');
    await page.fill('input[name="email"]', 'test@example.com');

    // 作成ボタンをクリック（ボタンのテキストやセレクターはプロジェクト仕様に合わせる）
    await page.click('text=作成');

    // 成功メッセージが表示されるのを確認
    const successMessage = page.locator('text=クライアント \'Test Client\' を作成しました');
    await expect(successMessage).toBeVisible();

    // 一覧に新しいクライアントが表示されているか確認
    const newClient = page.locator('text=Test Client');
    await expect(newClient).toBeVisible();
});
