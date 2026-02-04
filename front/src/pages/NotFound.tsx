import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl">ページが見つかりません</p>
      <Link to="/" className="btn btn-primary">
        トップに戻る
      </Link>
    </div>
  );
};

export default NotFound;
