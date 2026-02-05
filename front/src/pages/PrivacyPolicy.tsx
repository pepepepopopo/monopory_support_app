import { Link } from "react-router";

const PrivacyPolicy = () => {
  return (
    <div className="py-8 px-2">
      <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. はじめに</h2>
          <p>
            マネサク（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本サービスにおける情報の取り扱いについて説明します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. 収集する情報</h2>
          <p>本サービスは、以下の情報を収集する場合があります。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>ゲーム内で入力されるプレイヤー名</li>
            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
            <li>Cookie およびこれに類似する技術により収集される情報</li>
          </ul>
          <p className="mt-2">
            本サービスはユーザー登録を必要としないため、メールアドレス・パスワード等の個人情報は収集しません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. アクセス解析ツール</h2>
          <p>
            本サービスでは、Googleによるアクセス解析ツール「Google
            Analytics」を使用しています。Google
            Analyticsはデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p className="mt-2">
            この機能はCookieを無効にすることで収集を拒否できます。詳しくはお使いのブラウザの設定をご確認ください。Google
            Analyticsの利用規約については、Google
            Analyticsのサイトをご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. 広告配信について</h2>
          <p>
            本サービスでは、第三者配信の広告サービスを利用する場合があります。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. 情報の利用目的</h2>
          <p>収集した情報は、以下の目的で利用します。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>本サービスの提供・運営</li>
            <li>サービスの改善・新機能の開発</li>
            <li>利用状況の分析</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. 第三者への提供</h2>
          <p>
            本サービスは、法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. ポリシーの変更</h2>
          <p>
            本ポリシーの内容は、必要に応じて変更することがあります。変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、本サービスの運営者までご連絡ください。
          </p>
        </section>

        <p className="text-xs opacity-50 mt-8">制定日: 2026年2月5日</p>
      </div>

      <div className="mt-10 text-center text-xs opacity-50">
        <Link to="/" className="link">トップに戻る</Link>
        <span className="mx-2">|</span>
        <Link to="/terms" className="link">利用規約</Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
