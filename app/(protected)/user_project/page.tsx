import { db } from '@/lib/db';
import UserProjectClient from './page.client';

export default async function UserProjectPage() {
  // サーバー側でデータを非同期に取得
  const users = await db.user.findMany();
  // クライアントコンポーネントにデータを渡す
  return <UserProjectClient users={users} />;
}
