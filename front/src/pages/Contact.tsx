import { Link } from "react-router";

const Contact = () => {
  return (
    <div className="py-8 px-4 max-w-2xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2">お問い合わせ</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          マネサクをご利用いただきありがとうございます。
          サービスに関するご意見、ご要望、不具合の報告などは、以下のフォームよりお送りください。
        </p>

        {/* フォームのコンテナ */}
        <div className="w-full rounded-lg border border-gray-200 overflow-hidden bg-white">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSfGdRkQ2kiq8ktQIPgKIAiBCOXwbMphTmPF9f6Bc5zR2G_DHQ/viewform?embedded=true"
            className="w-full h-[850px]"
            title="お問い合わせフォーム"
          >
            読み込んでいます…
          </iframe>
        </div>
      </div>

      <div className="mt-12 text-center text-xs opacity-50">
        <Link to="/" className="link underline">トップへ戻る</Link>
      </div>
    </div>
  );
};

export default Contact;