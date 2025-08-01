const { pool } = require("../config/database");

class Payment {
  // Create new payment record
  static async createPayment(paymentData) {
    try {
      const {
        ID_Reservasi,
        Tanggal_Bayar,
        Jumlah,
        Jumlah_Bayar, // Alternative field name
        Bukti_Pembayaran,
        bukti_pembayaran, // Alternative field name
        Status = "Menunggu Verifikasi",
        periode,
      } = paymentData;

      // Validate required fields and handle undefined values
      if (!ID_Reservasi) {
        return {
          success: false,
          message: "ID_Reservasi is required",
        };
      }

      // Handle amount field (could be Jumlah or Jumlah_Bayar)
      const amount = Jumlah || Jumlah_Bayar || null;
      if (!amount) {
        return {
          success: false,
          message: "Payment amount is required",
        };
      }

      // Handle bukti pembayaran field (could be different names)
      const buktiPath = Bukti_Pembayaran || bukti_pembayaran || null;

      // Handle date - use current date if not provided
      const paymentDate =
        Tanggal_Bayar || new Date().toISOString().split("T")[0];

      // Generate periode if not provided
      const currentDate = new Date();
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const defaultPeriode = `${
        monthNames[currentDate.getMonth()]
      } ${currentDate.getFullYear()}`;
      const paymentPeriode = periode || defaultPeriode;

      const query = `
        INSERT INTO pembayaran (
          ID_Reservasi, 
          Tanggal_Bayar, 
          Jumlah, 
          Bukti_Pembayaran, 
          Status
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(query, [
        ID_Reservasi,
        paymentDate,
        amount,
        buktiPath,
        Status,
      ]);

      return {
        success: true,
        paymentId: result.insertId,
        message: "Payment record created successfully",
      };
    } catch (error) {
      console.error("Create payment error:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update payment status (for admin verification)
  static async updatePaymentStatus(paymentId, status, buktiPembayaran = null) {
    try {
      let query, params;

      if (buktiPembayaran) {
        query = `
          UPDATE pembayaran 
          SET Status = ?, Bukti_Pembayaran = ?, Tanggal_Bayar = NOW()
          WHERE ID_Pembayaran = ?
        `;
        params = [status, buktiPembayaran, paymentId];
      } else {
        query = `
          UPDATE pembayaran 
          SET Status = ?
          WHERE ID_Pembayaran = ?
        `;
        params = [status, paymentId];
      }

      const [result] = await pool.execute(query, params);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Payment not found",
        };
      }

      // If payment is marked as 'Diterima', update reservation status
      if (status === "Diterima") {
        const [payment] = await pool.execute(
          `
          SELECT ID_Reservasi FROM pembayaran WHERE ID_Pembayaran = ?
        `,
          [paymentId]
        );

        if (payment.length > 0) {
          await pool.execute(
            `
            UPDATE reservasi 
            SET Status = 'Aktif/Lunas' 
            WHERE ID_Reservasi = ?
          `,
            [payment[0].ID_Reservasi]
          );
        }
      }

      return {
        success: true,
        message: `Payment status updated to ${status}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get payment history for a reservation
  static async getPaymentHistory(reservationId) {
    try {
      const query = `
        SELECT p.*, r.Email, u.Nama
        FROM pembayaran p
        JOIN reservasi r ON p.ID_Reservasi = r.ID_Reservasi
        JOIN user u ON r.Email = u.Email
        WHERE p.ID_Reservasi = ?
        ORDER BY p.Created_At DESC
      `;

      const [payments] = await pool.execute(query, [reservationId]);
      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get all payments for admin
  static async getAllPayments() {
    try {
      const query = `
        SELECT 
          p.*,
          r.Email,
          r.No_Kamar,
          u.Nama,
          u.No_telp,
          k.Nama_Kamar,
          MONTH(p.Created_At) as periode_bulan,
          YEAR(p.Created_At) as periode_tahun
        FROM pembayaran p
        JOIN reservasi r ON p.ID_Reservasi = r.ID_Reservasi
        JOIN user u ON r.Email = u.Email
        JOIN kamar k ON r.No_Kamar = k.No_Kamar
        ORDER BY p.Created_At DESC
      `;

      const [payments] = await pool.execute(query);
      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get all pending payments for admin
  static async getAllPendingPayments() {
    try {
      const query = `
        SELECT 
          p.*,
          r.Email,
          r.No_Kamar,
          u.Nama,
          k.Nama_Kamar,
          MONTH(p.Created_At) as periode_bulan,
          YEAR(p.Created_At) as periode_tahun
        FROM pembayaran p
        JOIN reservasi r ON p.ID_Reservasi = r.ID_Reservasi
        JOIN user u ON r.Email = u.Email
        JOIN kamar k ON r.No_Kamar = k.No_Kamar
        WHERE p.Status = 'Menunggu'
        ORDER BY p.Created_At DESC
      `;

      const [payments] = await pool.execute(query);
      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get payment by ID
  static async getPaymentById(paymentId) {
    try {
      const query = `
        SELECT 
          p.*,
          r.Email,
          r.No_Kamar,
          u.Nama,
          k.Nama_Kamar
        FROM pembayaran p
        JOIN reservasi r ON p.ID_Reservasi = r.ID_Reservasi
        JOIN user u ON r.Email = u.Email
        JOIN kamar k ON r.No_Kamar = k.No_Kamar
        WHERE p.ID_Pembayaran = ?
      `;

      const [payments] = await pool.execute(query, [paymentId]);

      if (payments.length === 0) {
        return {
          success: false,
          message: "Payment not found",
        };
      }

      return {
        success: true,
        data: payments[0],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Penghuni: Update payment proof, status, and payment date
  static async updatePaymentProof(paymentId, buktiPath) {
    try {
      const updateQuery = `
        UPDATE pembayaran 
        SET Bukti_Pembayaran = ?, 
            Status = 'Menunggu', 
            Tanggal_Bayar = CURRENT_DATE,
            updated_at = CURRENT_TIMESTAMP
        WHERE ID_Pembayaran = ?
      `;
      const [result] = await pool.execute(updateQuery, [buktiPath, paymentId]);
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Payment not found or no changes made",
        };
      }
      const updatedPayment = await this.getPaymentById(paymentId);
      return {
        success: true,
        message: "Payment proof updated successfully",
        data: updatedPayment.data,
      };
    } catch (error) {
      console.error("Error updating payment proof:", error);
      return {
        success: false,
        message: "Failed to update payment proof",
      };
    }
  }

  // Admin: Update payment status only
  static async updatePaymentStatus(paymentId, status) {
    try {
      const updateQuery = `
        UPDATE pembayaran 
        SET Status = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE ID_Pembayaran = ?
      `;
      const [result] = await pool.execute(updateQuery, [status, paymentId]);
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Payment not found or no changes made",
        };
      }
      const updatedPayment = await this.getPaymentById(paymentId);
      return {
        success: true,
        message: `Payment status updated to ${status}`,
        data: updatedPayment.data,
      };
    } catch (error) {
      console.error("Error updating payment status:", error);
      return {
        success: false,
        message: "Failed to update payment status",
      };
    }
  }

  // Get unpaid payment by reservation ID
  static async getUnpaidPaymentByReservation(reservationId) {
    try {
      const query = `
        SELECT 
          p.*,
          r.Email,
          r.No_Kamar,
          u.Nama,
          k.Nama_Kamar
        FROM pembayaran p
        JOIN reservasi r ON p.ID_Reservasi = r.ID_Reservasi
        JOIN user u ON r.Email = u.Email
        JOIN kamar k ON r.No_Kamar = k.No_Kamar
        WHERE p.ID_Reservasi = ? 
        AND p.Status = 'Belum Bayar'
        ORDER BY p.created_at DESC
        LIMIT 1
      `;

      const [payments] = await pool.execute(query, [reservationId]);

      if (payments.length === 0) {
        return {
          success: false,
          message: "No unpaid payment found for this reservation",
        };
      }

      return {
        success: true,
        data: payments[0],
      };
    } catch (error) {
      console.error("Error getting unpaid payment:", error);
      return {
        success: false,
        message: "Failed to get unpaid payment",
      };
    }
  }

  // Create monthly payment record for user
  static async createMonthlyPayment(reservationId, buktiPembayaran) {
    try {
      const currentDate = new Date();

      // Check if payment already exists for current month
      const [existing] = await pool.execute(
        `
        SELECT * FROM pembayaran 
        WHERE ID_Reservasi = ? 
        AND YEAR(Created_At) = ? 
        AND MONTH(Created_At) = ?
      `,
        [reservationId, currentDate.getFullYear(), currentDate.getMonth() + 1]
      );

      if (existing.length > 0) {
        // Update existing payment
        const [result] = await pool.execute(
          `
          UPDATE pembayaran 
          SET Bukti_Pembayaran = ?, Status = 'Menunggu', Tanggal_Bayar = NOW()
          WHERE ID_Pembayaran = ?
        `,
          [buktiPembayaran, existing[0].ID_Pembayaran]
        );

        return {
          success: true,
          paymentId: existing[0].ID_Pembayaran,
          message: "Payment proof uploaded and status updated to pending",
        };
      } else {
        // Create new payment
        return await this.createPayment({
          ID_Reservasi: reservationId,
          Tanggal_Bayar: new Date(),
          Jumlah: 900000,
          Bukti_Pembayaran: buktiPembayaran,
          Status: "Menunggu",
        });
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get user payment history
  static async getUserPaymentHistory(userEmail) {
    try {
      const query = `
        SELECT 
          p.ID_Pembayaran,
          p.ID_Reservasi,
          YEAR(p.Created_At) as Periode_Tahun,
          MONTH(p.Created_At) as Periode_Bulan,
          p.Tanggal_Bayar,
          p.Jumlah,
          p.Status,
          r.No_Kamar,
          k.Nama_Kamar,
          u.Nama as Nama_Penyewa,
          r.Tanggal_Reservasi,
          MONTHNAME(p.Created_At) as nama_bulan
        FROM pembayaran p
        JOIN reservasi r ON p.ID_Reservasi = r.ID_Reservasi
        JOIN kamar k ON r.No_Kamar = k.No_Kamar
        JOIN user u ON r.Email = u.Email
        WHERE r.Email = ?
        ORDER BY Periode_Tahun DESC, Periode_Bulan DESC, p.Tanggal_Bayar DESC
        LIMIT 12
      `;

      const [rows] = await pool.execute(query, [userEmail]);

      return {
        success: true,
        data: rows,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get monthly payment history with filters
  static async getMonthlyPaymentHistory(userEmail, filters = {}) {
    try {
      const { year, month, status } = filters;

      let query = `
        SELECT 
          p.ID_Pembayaran as id,
          p.ID_Reservasi as reservasiId,
          YEAR(p.Created_At) as tahun,
          MONTH(p.Created_At) as bulan,
          p.Tanggal_Bayar as tanggalBayar,
          p.Jumlah as jumlah,
          p.Status as status,
          r.No_Kamar as nomorKamar,
          k.Nama_Kamar as namaKamar,
          u.Nama as namaPenyewa,
          r.Tanggal_Reservasi as tanggalReservasi,
          MONTHNAME(p.Created_At) as namaBulan,
          CASE 
            WHEN p.Status = 'Diterima' THEN 'lunas'
            WHEN p.Status = 'Belum Bayar' THEN 'belum'
            WHEN p.Status = 'Menunggu' THEN 'pending'
            ELSE LOWER(p.Status)
          END as statusFormatted
        FROM pembayaran p
        JOIN reservasi r ON p.ID_Reservasi = r.ID_Reservasi
        JOIN kamar k ON r.No_Kamar = k.No_Kamar
        JOIN user u ON r.Email = u.Email
        WHERE r.Email = ?
      `;

      const params = [userEmail];

      // Add filters
      if (year) {
        query += ` AND YEAR(p.Created_At) = ?`;
        params.push(year);
      }

      if (month) {
        query += ` AND MONTH(p.Created_At) = ?`;
        params.push(month);
      }

      if (status) {
        const statusMap = {
          lunas: "Diterima",
          belum: "Belum Bayar",
          pending: "Menunggu",
        };
        if (statusMap[status]) {
          query += ` AND p.Status = ?`;
          params.push(statusMap[status]);
        }
      }

      query += ` ORDER BY tahun DESC, bulan DESC, p.Tanggal_Bayar DESC`;

      const [rows] = await pool.execute(query, params);

      // Transform data to match frontend format
      const transformedRows = rows.map((row) => {
        return {
          id: row.id,
          periode: row.namaBulan
            ? `${row.namaBulan} ${row.tahun}`
            : `${row.bulan}/${row.tahun}`,
          bulan: row.bulan ? row.bulan.toString().padStart(2, "0") : "00",
          tahun: row.tahun ? row.tahun.toString() : "0000",
          jumlah: parseFloat(row.jumlah || 0),
          status: row.statusFormatted,
          tanggalBayar: row.tanggalBayar
            ? new Date(row.tanggalBayar).toISOString().split("T")[0]
            : null,
          tanggalJatuhTempo: row.tanggalJatuhTempo
            ? new Date(row.tanggalJatuhTempo).toISOString().split("T")[0]
            : null,
          metodePembayaran: row.metodePembayaran || "Transfer Bank",
          nomorReferensi:
            row.nomorReferensi ||
            `TRX${row.tahun || "2025"}${(row.bulan || 1)
              .toString()
              .padStart(2, "0")}${row.id.toString().padStart(6, "0")}`,
          namaKamar: row.namaKamar,
          nomorKamar: row.nomorKamar,
        };
      });

      return {
        success: true,
        data: transformedRows,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Legacy payment creation (for backwards compatibility)
  static async createPaymentLegacy(paymentData) {
    try {
      // This is a wrapper for legacy createPayment calls
      return await this.createPayment(paymentData);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get payment proof file path
  static async getPaymentProof(paymentId) {
    try {
      const query = `
        SELECT Bukti_Pembayaran 
        FROM pembayaran 
        WHERE ID_Pembayaran = ?
      `;

      const [rows] = await pool.execute(query, [paymentId]);

      if (rows.length === 0) {
        return {
          success: false,
          message: "Payment not found",
        };
      }

      if (!rows[0].Bukti_Pembayaran) {
        return {
          success: false,
          message: "Payment proof not found",
        };
      }

      return {
        success: true,
        filePath: rows[0].Bukti_Pembayaran,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Generate monthly payments for all active users
  static async generateMonthlyPaymentsForAllUsers(month, year) {
    try {
      console.log(`Starting payment generation for ${month}/${year}`);

      // Get all active tenants with reservation details
      const getUsersQuery = `
        SELECT DISTINCT 
          u.Nama,
          u.Email,
          r.ID_Reservasi,
          k.Nama_Kamar
        FROM user u
        JOIN reservasi r ON u.Email = r.Email
        JOIN kamar k ON r.No_Kamar = k.No_Kamar
        WHERE u.Role = 'penyewa' 
        AND r.Status != 'Keluar'
        AND r.Status = 'Aktif/Lunas'
      `;

      const [users] = await pool.execute(getUsersQuery);
      console.log(`Found ${users.length} active tenants`);

      if (users.length === 0) {
        return {
          success: true,
          message: "No active tenants found",
          generated: 0,
          errors: [],
        };
      }

      let generatedCount = 0;
      let errors = [];

      // Generate payment for each active user
      for (const user of users) {
        try {
          // Check if payment already exists for this period using DATE functions on Created_At
          const checkExistingQuery = `
            SELECT ID_Pembayaran 
            FROM pembayaran 
            WHERE ID_Reservasi = ? 
            AND MONTH(Created_At) = ? 
            AND YEAR(Created_At) = ?
          `;

          const [existing] = await pool.execute(checkExistingQuery, [
            user.ID_Reservasi,
            month,
            year,
          ]);

          if (existing.length > 0) {
            console.log(
              `Payment already exists for user ${user.Email} for ${month}/${year}`
            );
            continue;
          }

          // Create new payment record with Created_At set to target month
          // This allows us to track the payment period using DATE functions
          const targetDate = new Date(year, month - 1, 21); // 21st of target month

          const insertPaymentQuery = `
            INSERT INTO pembayaran (
              ID_Reservasi, 
              Jumlah, 
              Status,
              Created_At
            ) VALUES (?, ?, 'Belum Bayar', ?)
          `;

          await pool.execute(insertPaymentQuery, [
            user.ID_Reservasi,
            900000, // Default price as per database structure
            targetDate,
          ]);

          generatedCount++;
          console.log(
            `Generated payment for ${user.Nama} (${user.Email}) - Room: ${user.Nama_Kamar} - Amount: 900000`
          );
        } catch (userError) {
          console.error(
            `Error generating payment for user ${user.Email}:`,
            userError
          );
          errors.push({
            userEmail: user.Email,
            userName: user.Nama,
            error: userError.message,
          });
        }
      }

      console.log(
        `Payment generation completed. Generated: ${generatedCount}, Errors: ${errors.length}`
      );

      return {
        success: true,
        message: `Successfully generated ${generatedCount} payments`,
        generated: generatedCount,
        errors: errors,
      };
    } catch (error) {
      console.error("Error in generateMonthlyPaymentsForAllUsers:", error);
      return {
        success: false,
        message: "Failed to generate monthly payments",
        error: error.message,
      };
    }
  }

  // Get payment generation history
  static async getGenerationHistory() {
    try {
      const query = `
        SELECT 
          DATE(Created_At) as generation_date,
          COUNT(*) as payments_generated,
          MONTH(Created_At) as month,
          YEAR(Created_At) as year
        FROM pembayaran 
        WHERE DATE(Created_At) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(Created_At), MONTH(Created_At), YEAR(Created_At)
        ORDER BY Created_At DESC
        LIMIT 10
      `;

      const [results] = await pool.execute(query);

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error("Error in getGenerationHistory:", error);
      return {
        success: false,
        message: "Failed to get generation history",
        error: error.message,
      };
    }
  }
}

module.exports = Payment;
