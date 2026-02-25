import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <p>404</p>
      <h1>ページが見つかりません</h1>
      <p>URLをご確認いただくか、トップページから再度お探しください。</p>
      <Link href="/ja/">トップへ戻る</Link>
    </main>
  );
}
