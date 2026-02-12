import { Link } from "react-router";

const PrivacyPolicy = () => {
  return (
    <div className="py-8 px-2 max-w-2xl mx-auto"> {/* 読みやすさのためmax-width推奨 */}
      <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>

      <div className="space-y-6 text-sm leading-relaxed text-gray-800">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. はじめに</h2>
          <p>
            マネサク（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本サービスにおける情報の取り扱いについて説明します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. 広告の配信について</h2>
          <p>
            本サービスでは、第三者配信の広告サービス「Google AdSense」を利用しています。
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2 ml-2">
            <li>
              Googleなどの第三者配信事業者は、Cookie（クッキー）を使用して、ユーザーが本サービスや他のウェブサイトに過去にアクセスした際の情報に基づいて広告を配信します。
            </li>
            <li>
              Googleが広告 Cookie を使用することにより、ユーザーが本サービスや他のサイトにアクセスした際の情報に基づいて、Google やそのパートナーが適切な広告をユーザーに表示できます。
            </li>
            <li>
              ユーザーは、Googleアカウントの
              <a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
                広告設定
              </a>
              で、パーソナライズ広告を無効にできます。または、
              <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
                www.aboutads.info
              </a>
              にアクセスすれば、パーソナライズ広告に使われる第三者配信事業者の Cookie を無効にできます。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. アクセス解析ツール</h2>
          <p>
            本サービスでは、Googleによるアクセス解析ツール「Google Analytics」を使用しています。Google Analyticsはデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p className="mt-2">
            この機能はCookieを無効にすることで収集を拒否できます。詳しくはお使いのブラウザの設定をご確認ください。Google Analyticsの利用規約については、
            <a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
              Google Analyticsのサイト
            </a>
            をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. 収集する情報</h2>
          <p>本サービスは、広告配信および解析の他に以下の情報を収集する場合があります。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>ゲーム内で一時的に使用されるプレイヤー名</li>
            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            ※プレイヤー名はブラウザのローカル環境での管理を主とし、サーバー側で個人を特定する形で恒久的に保存することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. 免責事項</h2>
          <p>
            本サービスのコンテンツ・情報について、可能な限り正確な情報を掲載するよう努めておりますが、正確性や安全性を保証するものではありません。
          </p>
          <p className="mt-2">
            本サービスを利用したことによるゲーム上のトラブル、損害、データの消失等について、運営者は一切の責任を負いかねます。また、本サービスからリンク等によって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせ、および本サービスに関するご連絡は、運営者（manesaku.com お問い合わせ窓口）までお願いいたします。
          </p>
        </section>

        <p className="text-xs opacity-50 mt-8">制定日: 2026年2月5日<br />改定日: 2026年2月12日</p>
      </div>

      <div className="mt-10 text-center text-xs opacity-50">
        <Link to="/" className="link underline">トップに戻る</Link>
        <span className="mx-2">|</span>
        <Link to="/terms" className="link underline">利用規約</Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;