import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Format currency in Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a HTML template for member card PDF
 */
export function generateMemberCardHTML(profile: any): string {
  const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '-';
  
  const birthDate = profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '-';

  // Convert relative image URL to absolute URL if it exists
  const imageUrl = profile.profileImage ? 
    (profile.profileImage.startsWith('http') ? 
      profile.profileImage : 
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${profile.profileImage}`) 
    : null;

  // Generate HTML with proper profile image handling
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Kartu Anggota Perpustakaan</title>
      <style>
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          color: #333;
          line-height: 1.5;
          margin: 0;
          padding: 0;
        }
        .card-container {
          width: 90%;
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%);
          border: 1px solid #cfd9e6;
        }
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #3b82f6;
        }
        .logo {
          margin-right: 20px;
          font-size: 40px;
          font-weight: bold;
          color: #3b82f6;
        }
        .title-container {
          flex-grow: 1;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          color: #1e3a8a;
        }
        .subtitle {
          font-size: 16px;
          color: #64748b;
          margin: 0;
        }
        .content {
          display: flex;
          margin-bottom: 20px;
        }
        .profile-image {
          width: 120px;
          height: 120px;
          border-radius: 60px;
          background-color: #e5e7eb;
          margin-right: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: #9ca3af;
          overflow: hidden;
          border: 2px solid #3b82f6;
        }
        .profile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .member-info {
          flex-grow: 1;
        }
        .member-name {
          font-size: 22px;
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 10px;
          color: #1e40af;
        }
        .member-id {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .member-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .detail-item {
          margin-bottom: 8px;
        }
        .detail-label {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 2px;
        }
        .detail-value {
          font-weight: 500;
        }
        .qr-code {
          text-align: center;
          margin-left: 20px;
        }
        .qr-code img {
          width: 100px;
          height: 100px;
          border: 1px solid #e5e7eb;
          padding: 5px;
          background: white;
        }
        .qr-caption {
          font-size: 12px;
          color: #64748b;
          margin-top: 5px;
        }
        .footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #64748b;
          text-align: center;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .card-container {
            box-shadow: none;
            margin: 0;
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="card-container">
        <div class="header">
          <div class="logo">📚</div>
          <div class="title-container">
            <h1 class="title">Perpustakaan Digital</h1>
            <p class="subtitle">Kartu Anggota Resmi</p>
          </div>
        </div>
        
        <div class="content">
          <div class="profile-image">
            ${imageUrl ? 
              `<img src="${imageUrl}" alt="Foto Profil" />` : 
              profile.name.charAt(0).toUpperCase()}
          </div>
          
          <div class="member-info">
            <h2 class="member-name">${profile.name}</h2>
            <div class="member-id">${profile.memberId}</div>
            
            <div class="member-details">
              <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${profile.email}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Tanggal Bergabung</div>
                <div class="detail-value">${joinDate}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Alamat</div>
                <div class="detail-value">${profile.address || '-'}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">No. Telepon</div>
                <div class="detail-value">${profile.phone || '-'}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Tanggal Lahir</div>
                <div class="detail-value">${birthDate}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">${profile.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</div>
              </div>
            </div>
          </div>
          
          <div class="qr-code">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${profile.memberId}" alt="QR Code" />
            <div class="qr-caption">Scan untuk verifikasi</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Kartu ini adalah dokumen resmi dan merupakan identitas untuk mengakses layanan perpustakaan.</p>
          <p>© ${new Date().getFullYear()} Perpustakaan Digital. Berlaku sampai dengan status keanggotaan tidak aktif.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate a unique member ID with format A0001
 * @returns A new unique member ID
 */
export async function generateMemberId(prisma: any): Promise<string> {
  const prefix = "A";
  
  // Find the last member ID
  const lastMember = await prisma.user.findFirst({
    where: {
      memberId: {
        startsWith: prefix
      }
    },
    orderBy: {
      memberId: 'desc'
    }
  });
  
  let sequentialNumber = 1;
  
  if (lastMember) {
    // Extract the sequential number from the last member ID
    const lastSequentialStr = lastMember.memberId.substring(prefix.length);
    const lastSequential = parseInt(lastSequentialStr, 10);
    
    if (!isNaN(lastSequential)) {
      sequentialNumber = lastSequential + 1;
    }
  }
  
  // Format the sequential number with leading zeros
  const sequentialStr = sequentialNumber.toString().padStart(4, '0');
  
  return `${prefix}${sequentialStr}`;
}

/**
 * Migrates existing member IDs from M prefix to A prefix
 * Should be called only once during system update
 * @returns Number of migrated IDs
 */
export async function migrateMemberIds(prisma: any): Promise<number> {
  // Find all users with M prefix
  const users = await prisma.user.findMany({
    where: {
      memberId: {
        startsWith: "M"
      }
    }
  });
  
  let count = 0;
  
  // Update each user's memberId
  for (const user of users) {
    // Extract the sequential number
    const sequentialStr = user.memberId.substring(1);
    const sequentialNum = parseInt(sequentialStr, 10);
    
    if (!isNaN(sequentialNum)) {
      // Create new memberId with A prefix
      const newMemberId = `A${sequentialNum.toString().padStart(4, '0')}`;
      
      // Update the user
      await prisma.user.update({
        where: { id: user.id },
        data: { memberId: newMemberId }
      });
      
      count++;
    }
  }
  
  return count;
}
