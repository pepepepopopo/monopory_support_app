import { Link } from "react-router";

const Terms = () => {
  return (
    <div className="py-8 px-2">
      <h1 className="text-2xl font-bold mb-6">利用規約</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">第1条（適用）</h2>
          <p>
            本規約は、マネサク（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">第2条（サービスの内容）</h2>
          <p>
            本サービスは、ボードゲーム（モノポリー、人生ゲーム等）における紙幣管理をデジタル化し、スマートフォンのブラウザ上で銀行役の代替として利用できるWebアプリケーションです。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">第3条（禁止事項）</h2>
          <p>ユーザーは、以下の行為を行ってはならないものとします。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>本サービスの運営を妨害する行為</li>
            <li>他のユーザーに不利益を与える行為</li>
            <li>不正アクセスまたはこれを試みる行為</li>
            <li>本サービスを営利目的で利用する行為（運営者が許可した場合を除く）</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">第4条（サービスの変更・停止）</h2>
          <p>
            運営者は、事前の通知なく本サービスの内容を変更、または提供を停止・中断することができるものとします。これによりユーザーに生じた損害について、運営者は一切の責任を負わないものとします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">第5条（免責事項）</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              本サービスは現状有姿で提供され、その正確性・完全性・有用性を保証するものではありません。
            </li>
            <li>
              本サービスの利用により生じた損害について、運営者は故意または重過失がない限り責任を負いません。
            </li>
            <li>
              本サービスはゲームの補助ツールであり、金銭の実際の取引を伴うものではありません。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">第6条（知的財産権）</h2>
          <p>
            本サービスに関する知的財産権は、運営者に帰属します。ユーザーは、運営者の許可なく本サービスのコンテンツを複製・転載・改変してはならないものとします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">第7条（規約の変更）</h2>
          <p>
            運営者は、必要に応じて本規約を変更できるものとします。変更後の利用規約は、本ページに掲載した時点から効力を生じるものとします。
          </p>
        </section>

        <p className="text-xs opacity-50 mt-8">制定日: 2026年2月5日</p>
      </div>

      <div className="mt-10 text-center">
        <Link to="/" className="btn btn-primary btn-sm">ゲームを始める</Link>
      </div>

      <div className="mt-6 text-center text-xs opacity-50">
        <Link to="/" className="link">トップに戻る</Link>
        <span className="mx-2">|</span>
        <Link to="/privacy" className="link">プライバシーポリシー</Link>
      </div>
    </div>
  );
};

export default Terms;
