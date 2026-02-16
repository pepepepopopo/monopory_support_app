import { Link } from "react-router";

const About = () => {
  return (
    <div className="py-8 px-4 max-w-2xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2">マネサクについて</h1>

      <div className="space-y-8 line-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">マネサクとは？</h2>
          <p>
            マネサクは、モノポリーや人生ゲームなどのボードゲームで発生する「面倒な現金管理」をスマートに解決するためのWebアプリです。
          </p>
          <p className="mt-3">
            紙幣の準備や両替、計算の手間をデジタル化することで、プレイヤー全員がゲームそのものの戦略や会話に集中できる環境を提供します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">開発の背景</h2>
          <p>
            ボードゲームは楽しいものですが、銀行役（銀行担当）になると、支払いの計算や細かいお釣りのやり取りに追われ、自分自身のプレイが疎かになってしまうことがあります。
          </p>
          <p className="mt-3">
            「もっとサクサクとお金を動かしたい」「銀行役の負担をゼロにしたい」という思いから、インストール不要ですぐに使えるマネサクを開発しました。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">マネサクでできること</h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>リアルタイム同期：</strong> 全プレイヤーの残高を瞬時に共有。</li>
            <li><strong>ワンタップ送金：</strong> 面倒な紙幣のやり取りをデジタルで完結。</li>
            <li><strong>ログ管理：</strong> お金の流れが記録されるため、計算ミスを防げます。</li>
            <li><strong>教育への活用：</strong> 正確な数字の動きが見えるため、お子様の金銭教育にも最適です。</li>
          </ul>
        </section>

        <section className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-blue-900">運営者メッセージ</h2>
          <p className="text-sm text-blue-800">
            マネサクは、アナログゲームの良さとデジタルの便利さを融合させることを目指しています。
            皆様のゲームナイトが、より楽しく、より熱狂的なものになれば幸いです。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">サイト情報</h2>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b">
                <th className="py-2 text-left w-32">サイト名</th>
                <td className="py-2">マネサク</td>
              </tr>
              <tr className="border-b">
                <th className="py-2 text-left">URL</th>
                <td className="py-2">https://manesaku.com/</td>
              </tr>
              <tr className="border-b">
                <th className="py-2 text-left">運営者</th>
                <td className="py-2">マネサク運営事務局</td>
              </tr>
              <tr>
                <th className="py-2 text-left">お問い合わせ</th>
                <td className="py-2">
                  <Link to="/contact" className="text-blue-600 underline">
                    お問い合わせフォーム
                  </Link>
                  をご覧ください
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-10 text-center bg-primary text-primary-content rounded-xl p-8">
        <h2 className="text-xl font-bold mb-2">マネサクを試してみる</h2>
        <p className="text-sm opacity-90 mb-4">インストール不要。ブラウザですぐに使えます。</p>
        <Link to="/" className="btn btn-secondary">無料で始める</Link>
      </div>

      <div className="mt-8 text-center text-xs opacity-50">
        <Link to="/" className="link underline">トップへ戻る</Link>
      </div>
    </div>
  );
};

export default About;