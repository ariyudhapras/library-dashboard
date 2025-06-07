import Link from "next/link";

interface Book {
  id: number;
  title: string;
  author: string;
  borrowCount: number;
  coverImage?: string | null;
}

interface PopularBookCardProps {
  book: Book;
  rank: number;
  onClick?: () => void;
}

export default function PopularBookCard({
  book,
  rank,
  onClick,
}: PopularBookCardProps) {
  const rankBadges = [
    { icon: "🥇", color: "bg-yellow-500 text-yellow-900" },
    { icon: "🥈", color: "bg-gray-400 text-gray-900" },
    { icon: "🥉", color: "bg-amber-600 text-amber-900" },
  ];

  const rankBadge = rankBadges[rank - 1];

  const cardContent = (
    <div
      className="relative group bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 w-44 p-4 flex flex-col items-center cursor-pointer"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${book.title}`}
    >
      {/* Badge Ranking */}
      {rank <= 3 && (
        <div
          className={`absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full ${rankBadge.color} flex items-center justify-center text-xs font-bold shadow-lg`}
        >
          {rankBadge.icon}
        </div>
      )}

      {/* Cover Buku */}
      <div className="w-full aspect-[3/4] mb-3 relative overflow-hidden rounded-lg">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Cover</span>
          </div>
        )}
      </div>

      {/* Badge Jumlah Peminjaman */}
      <div className="mb-3">
        <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-md">
          🔥 {book.borrowCount} borrowed
        </span>
      </div>

      {/* Info Buku */}
      <div className="text-center w-full">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>
      </div>
    </div>
  );

  // Jika ada onClick, return div biasa, jika tidak ada return Link
  if (onClick) {
    return cardContent;
  }

  return (
    <Link
      href={`/books/${book.id}`}
      className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl"
    >
      {cardContent}
    </Link>
  );
}
