export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Replaced prisma with supabase
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { differenceInDays } from "date-fns";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  let format: string | undefined;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { filters } = body;
    format = body.format;

    // Build filter conditions (same logic as your existing API)
    const filterConditions: any = {};

    if (filters?.startDate) {
      filterConditions.borrowDate = {
        gte: new Date(filters.startDate),
      };
    }

    if (filters?.endDate) {
      filterConditions.borrowDate = {
        ...filterConditions.borrowDate,
        lte: new Date(filters.endDate),
      };
    }

    if (filters?.status && filters.status !== "all") {
      filterConditions.status = filters.status;
    }

    if (filters?.memberId && !isNaN(Number(filters.memberId))) {
      filterConditions.userId = parseInt(filters.memberId);
    }

    // Build Supabase query
    let query = supabase
      .from('bookLoan')
      .select(`
        *,
        user (id, memberId, name, email),
        book (id, title, author, isbn, publisher)
      `);

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('borrowDate', new Date(filters.startDate).toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('borrowDate', new Date(filters.endDate).toISOString());
    }
    if (filters?.status && filters.status !== "all") {
      query = query.eq('status', filters.status);
    }
    if (filters?.memberId && !isNaN(Number(filters.memberId))) {
      query = query.eq('userId', parseInt(filters.memberId));
    }

    // Apply ordering
    query = query.order('borrowDate', { ascending: false });

    // Get loan data
    const { data: loansData, error: dbError } = await query;

    if (dbError) {
      console.error("Error fetching loans from Supabase:", dbError);
      return NextResponse.json({ error: "Failed to fetch loan data" }, { status: 500 });
    }

    const loans = loansData || [];

    // Process the loans data (same logic as your existing API)
    const processedLoans = loans.map((loan: any, index: number) => {
      let lateDays = 0;
      let fine = 0;

      if (loan.status === "LATE" && loan.actualReturnDate) {
        lateDays = differenceInDays(
          new Date(loan.actualReturnDate),
          new Date(loan.returnDate)
        );

        if (lateDays > 0) {
          fine = lateDays * 5000;
        }
      }

      return {
        No: index + 1,
        "Member ID": loan.user.memberId || `USER-${loan.user.id}`,
        "Member Name": loan.user.name,
        "Member Email": loan.user.email,
        "Book Title": loan.book.title,
        "Book Author": loan.book.author,
        "Book Publisher": loan.book.publisher || "",
        ISBN: loan.book.isbn || "",
        "Borrow Date": new Date(loan.borrowDate).toLocaleDateString("en-US"),
        "Due Date": new Date(loan.returnDate).toLocaleDateString("en-US"),
        "Return Date": loan.actualReturnDate
          ? new Date(loan.actualReturnDate).toLocaleDateString("en-US")
          : "",
        Status: loan.status,
        "Late Days": lateDays,
        "Fine (IDR)": fine,
        Notes: loan.notes || "",
      };
    });

    if (format === "excel") {
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(processedLoans);
      const workbook = XLSX.utils.book_new();

      // Set column widths
      const colWidths = [
        { wch: 5 }, // No
        { wch: 12 }, // Member ID
        { wch: 20 }, // Member Name
        { wch: 25 }, // Member Email
        { wch: 30 }, // Book Title
        { wch: 20 }, // Book Author
        { wch: 20 }, // Book Publisher
        { wch: 15 }, // ISBN
        { wch: 12 }, // Borrow Date
        { wch: 12 }, // Due Date
        { wch: 12 }, // Return Date
        { wch: 10 }, // Status
        { wch: 10 }, // Late Days
        { wch: 15 }, // Fine
        { wch: 20 }, // Notes
      ];
      worksheet["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Library Reports");

      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="library_report_${
            new Date().toISOString().split("T")[0]
          }.xlsx"`,
        },
      });
    } else {
      // If format is not excel, return error
      return NextResponse.json({ error: "Invalid format. Only Excel is supported." }, { status: 400 });
    }

  } catch (error) {
    console.error(`Error exporting report (format: ${format || 'unknown'}):`, error instanceof Error ? error.message : error, error instanceof Error ? error.stack : '');
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    );
  }
}
