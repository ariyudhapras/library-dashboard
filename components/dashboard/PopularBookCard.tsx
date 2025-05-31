import Link from "next/link";

export default function PopularBookCard({ book, rank, large = false, cardWidth }: { book: any, rank: number, large?: boolean, cardWidth?: string }) {
  const rankBadge = [
    { icon: "🥇", color: "bg-yellow-400" },
    { icon: "🥈", color: "bg-gray-300" },
    { icon: "🥉", color: "bg-amber-700" },
  ][rank - 1];

  // Ukuran dinamis
  const defaultCardWidth = large ? "w-64 md:w-80" : "w-48 md:w-64";
  const cardWidthClass = cardWidth ? cardWidth : defaultCardWidth;
  const coverClass = large ? "w-full h-auto min-h-[20rem] md:min-h-[28rem]" : "w-full h-auto min-h-[16rem] md:min-h-[22rem]";

  return (
    <Link href={`/books/${book.id}`} className="inline-block focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl">
      <div
        className={`relative group bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition ${cardWidthClass} p-3 flex flex-col items-center`}
        tabIndex={0}
        aria-label={`Lihat detail ${book.title}`}
      >
        {/* Badge Ranking */}
        {rank <= 3 && (
          <span className={`absolute top-2 left-2 z-10 px-2 py-1 text-xs font-bold rounded-full ${rankBadge.color} text-white shadow`}>
            {rankBadge.icon}
          </span>
        )}
        {/* Cover Buku */}
        <div className="aspect-[2/3] w-full flex items-center justify-center mb-2 relative">
          <img
            src={book.coverImage}
            alt={`Sampul buku ${book.title}`}
            className={`object-cover rounded-lg shadow ${coverClass}`}
            style={{ aspectRatio: "2/3" }}
            loading="lazy"
          />
        </div>
        {/* Badge Jumlah Peminjaman */}
        <span className="mt-2 mb-1 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs shadow font-semibold whitespace-nowrap">
          🔥 {book.borrowCount} peminjaman
        </span>
        {/* Info Buku */}
        <div className="mt-1 text-center w-full">
          <div className={`font-semibold truncate text-gray-900 ${large ? "text-lg md:text-xl" : "text-base md:text-lg"}`}>{book.title}</div>
          <div className="text-sm text-gray-500 truncate">{book.author}</div>
        </div>
      </div>
    </Link>
  );
} 