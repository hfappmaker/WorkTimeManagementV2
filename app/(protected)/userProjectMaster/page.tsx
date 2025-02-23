import { db } from '@/lib/db';
import UserProjectMasterClient from './page.client';

export default async function UserProjectMaster() {
  // サーバー側でデータを非同期に取得
  const users = await db.user.findMany();
  // クライアントコンポーネントにデータを渡す
  return <UserProjectMasterClient users={users} />;
}
