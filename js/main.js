// ==============================================
// IMPORT FIREBASE DATABASE (REALTIME)
// ==============================================
import { db } from "./firebase.js";
import {
  ref,
  onValue,
  push,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Variabel Penampung Listener Firebase
let unsubscribeDashboard = null;

// Helper: Konversi Nominal (Teks/Angka) ke Number secara Aman
function bersihkanNominal(nilai) {
  if (typeof nilai === "number") return nilai;
  if (!nilai) return 0;
  const bersih = String(nilai).replace(/[^0-9]/g, "");
  return Number(bersih) || 0;
}

// ==============================================
// FUNGSI NOTIFIKASI & KONFIRMASI GLOBAL
// ==============================================
window.tampilkanNotifikasi = function (jenis, pesan, durasi = 3400) {
  const wadah = document.getElementById("wadah-notifikasi");
  if (!wadah) return;

  const ikonSvg = {
    berhasil: `<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>`,
    error: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    warning: `<svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
    info: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  };

  const el = document.createElement("div");
  el.className = `notifikasi notif-${jenis}`;
  el.innerHTML = `
    <span class="ikon-notif">${ikonSvg[jenis] || ikonSvg.info}</span>
    <span class="pesan-notif">${pesan}</span>
    <button type="button" class="tutup-notif" aria-label="Tutup">×</button>
  `;

  wadah.prepend(el);
  const timer = setTimeout(() => {
    el.classList.add("notif-hilang");
    setTimeout(() => el.remove(), 350);
  }, durasi);

  el.querySelector(".tutup-notif").addEventListener("click", () => {
    clearTimeout(timer);
    el.classList.add("notif-hilang");
    setTimeout(() => el.remove(), 350);
  });
};

window.tampilkanKonfirmasi = function (
  pesan,
  fungsiJikaYa,
  teksTombolYa = "Ya, Lanjutkan",
) {
  const wadahLama = document.getElementById("wadah-konfirmasi");
  if (wadahLama) wadahLama.remove();

  const wadah = document.createElement("div");
  wadah.id = "wadah-konfirmasi";
  wadah.className = "wadah-konfirmasi-kustom";
  wadah.innerHTML = `
    <div class="kotak-konfirmasi-kustom">
      <div class="ikon-konfirmasi">⚠️</div>
      <h4 class="judul-konfirmasi">Konfirmasi Tindakan</h4>
      <p class="pesan-konfirmasi">${pesan}</p>
      <div class="tombol-konfirmasi-kustom">
        <button type="button" class="btn-konfirmasi-batal">Batal</button>
        <button type="button" class="btn-konfirmasi-ya">${teksTombolYa}</button>
      </div>
    </div>
  `;
  document.body.appendChild(wadah);

  requestAnimationFrame(() => wadah.classList.add("tampil"));

  const tutup = () => {
    wadah.classList.remove("tampil");
    setTimeout(() => wadah.remove(), 200);
  };

  wadah.querySelector(".btn-konfirmasi-batal").onclick = tutup;
  wadah.querySelector(".btn-konfirmasi-ya").onclick = () => {
    tutup();
    fungsiJikaYa();
  };
};

window.prompt = function (judul, petunjuk = "") {
  const wadahLama = document.getElementById("wadah-input-kustom");
  if (wadahLama) wadahLama.remove();

  const wadah = document.createElement("div");
  wadah.id = "wadah-input-kustom";
  wadah.className = "wadah-input-kustom";
  wadah.innerHTML = `
    <div class="kotak-input-kustom">
      <h4 id="judul-input">${judul || "Input Data"}</h4>
      <p id="petunjuk-input">${petunjuk || "Masukkan nominal di bawah ini:"}</p>
      <input type="text" id="nilai-input" placeholder="Contoh: 750000" inputmode="numeric">
      <div class="tombol-input">
        <button type="button" id="btn-batal-input" class="btn-batal">Batal</button>
        <button type="button" id="btn-ok-input" class="btn-ya">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(wadah);

  const input = document.getElementById("nilai-input");
  input.value = "";

  requestAnimationFrame(() => {
    wadah.classList.add("tampil");
    input.focus();
  });

  return new Promise((resolve) => {
    const tutup = () => {
      wadah.classList.remove("tampil");
      setTimeout(() => wadah.remove(), 150);
      resolve(null);
    };
    const ok = () => {
      const val = input.value.trim();
      wadah.classList.remove("tampil");
      setTimeout(() => wadah.remove(), 150);
      resolve(val);
    };

    document.getElementById("btn-batal-input").onclick = tutup;
    document.getElementById("btn-ok-input").onclick = ok;
    input.onkeydown = (e) => {
      if (e.key === "Enter") ok();
      if (e.key === "Escape") tutup();
    };
  });
};

// ==============================================
// FUNGSI UTAMA HITUNG DASHBOARD (REALTIME FIREBASE)
// ==============================================
function muatDashboardUtama() {
  if (unsubscribeDashboard) {
    unsubscribeDashboard();
  }

  const transaksiRef = ref(db, "transaksi");

  unsubscribeDashboard = onValue(transaksiRef, (snapshot) => {
    const dataFirebase = snapshot.val();
    const dataRiwayat = [];

    if (dataFirebase) {
      Object.keys(dataFirebase).forEach((key) => {
        dataRiwayat.push({
          idFirebase: key,
          ...dataFirebase[key],
        });
      });
    }

    // Simpan data riwayat ke global agar dapat diakses oleh modul tabungan & laporan
    window.dataRiwayatGlobal = dataRiwayat;

    const rekapPerTanggal = {};

    dataRiwayat.forEach((t) => {
      const tgl = t.tanggal;
      if (!tgl) return;

      if (!rekapPerTanggal[tgl]) {
        rekapPerTanggal[tgl] = {
          tanggal: tgl,
          tunai: 0,
          qrisMasuk: 0,
          transfer: 0,
          tabunganWajib: 495000,
          kasbon: 0,
          namaKasbon: [],
          belanjaPasar: 0,
          opsRiil: 0,
          qrisKeluar: 0,
          ditalangiOwner: 0,
          bayarOwner: 0,
          keterangan: [],
        };
      }

      const item = rekapPerTanggal[tgl];
      const nominal = bersihkanNominal(t.jumlah);

      switch (t.kategori) {
        case "tunai":
          item.tunai += nominal;
          break;
        case "qris_masuk":
          item.qrisMasuk += nominal;
          break;
        case "transfer":
          item.transfer += nominal;
          break;
        case "belanja_pasar":
          item.belanjaPasar += nominal;
          break;
        case "ops_riil":
          item.opsRiil += nominal;
          break;
        case "makan_karyawan":
          item.opsRiil += nominal;
          item.keterangan.push(t.keterangan || "Uang Makan Karyawan");
          break;
        case "qris_keluar":
          item.qrisKeluar += nominal;
          break;
        case "kasbon":
          item.kasbon += nominal;
          if (t.keterangan) item.namaKasbon.push(t.keterangan);
          break;
        case "talangan_owner":
          item.ditalangiOwner += nominal;
          break;
        case "bayar_owner":
          item.bayarOwner += nominal;
          break;
      }

      if (
        t.keterangan &&
        t.kategori !== "kasbon" &&
        t.kategori !== "makan_karyawan"
      ) {
        item.keterangan.push(t.keterangan);
      }
    });

    const dataLaporan = Object.values(rekapPerTanggal).map((row) => {
      const omset = row.tunai + row.qrisMasuk + row.transfer;
      const totalPengeluaranOps =
        row.belanjaPasar + row.opsRiil + row.qrisKeluar + row.ditalangiOwner;
      const labaKotor = omset - totalPengeluaranOps;
      const labaBersih = labaKotor - row.tabunganWajib - row.kasbon;

      return {
        ...row,
        omset,
        labaKotor,
        labaBersih,
        namaKaryawanKasbon: row.namaKasbon.join(", ") || "-",
        keterangan: row.keterangan.join(" | ") || "-",
      };
    });

    let totalOmset = 0;
    let totalLabaKotor = 0;
    let totalLabaBersih = 0;
    let totalDitalangiBuDewi = 0;
    let totalSudahDibayarBuDewi = 0;

    dataLaporan.forEach((item) => {
      totalOmset += item.omset;
      totalLabaKotor += item.labaKotor;
      totalLabaBersih += item.labaBersih;
      totalDitalangiBuDewi += item.ditalangiOwner;
      totalSudahDibayarBuDewi += item.bayarOwner;
    });

    let sisaKekuranganBuDewi = totalDitalangiBuDewi - totalSudahDibayarBuDewi;

    // Update Ringkasan Keuangan
    const elOmset = document.getElementById("nilai-omset");
    const elLabaKotor = document.getElementById("nilai-labakotor");
    const elLabaBersih = document.getElementById("nilai-lababersih");

    if (elOmset) elOmset.innerText = `Rp ${totalOmset.toLocaleString("id-ID")}`;
    if (elLabaKotor)
      elLabaKotor.innerText = `Rp ${totalLabaKotor.toLocaleString("id-ID")}`;
    if (elLabaBersih)
      elLabaBersih.innerText = `Rp ${totalLabaBersih.toLocaleString("id-ID")}`;

    // Tabel Laporan Harian
    const tbodyLaporan = document.getElementById("isi-tabel-laporan");
    const elWaktu = document.getElementById("waktu-perbarui");

    if (tbodyLaporan) {
      if (dataLaporan.length === 0) {
        tbodyLaporan.innerHTML = `<tr><td colspan="15" class="tabel-kosong">Belum ada data laporan harian. Silakan input transaksi baru.</td></tr>`;
      } else {
        tbodyLaporan.innerHTML = dataLaporan
          .map(
            (row) => `
          <tr>
            <td>${row.tanggal}</td>
            <td>Rp ${row.tunai.toLocaleString("id-ID")}</td>
            <td>Rp ${row.qrisMasuk.toLocaleString("id-ID")}</td>
            <td>Rp ${row.transfer.toLocaleString("id-ID")}</td>
            <td>Rp ${row.tabunganWajib.toLocaleString("id-ID")}</td>
            <td>Rp ${row.kasbon.toLocaleString("id-ID")}</td>
            <td>${row.namaKaryawanKasbon}</td>
            <td>Rp ${row.belanjaPasar.toLocaleString("id-ID")}</td>
            <td>Rp ${row.opsRiil.toLocaleString("id-ID")}</td>
            <td>Rp ${row.qrisKeluar.toLocaleString("id-ID")}</td>
            <td><strong>Rp ${row.omset.toLocaleString("id-ID")}</strong></td>
            <td><strong>Rp ${row.labaKotor.toLocaleString("id-ID")}</strong></td>
            <td><strong>Rp ${row.labaBersih.toLocaleString("id-ID")}</strong></td>
            <td style="max-width: 250px; font-size: 12px;">${row.keterangan}</td>
            <td><span style="color:#22c55e; font-weight:bold; font-size:12px;">✓ Sukses</span></td>
          </tr>
        `,
          )
          .join("");
      }
    }

    // Rekapitulasi Bu Dewi
    const wadahTabelUtama = document.getElementById("wadah-tabel-transaksi");
    if (wadahTabelUtama) {
      let elBuDewi = document.getElementById("wadah-tanggungan-budewi");
      if (!elBuDewi) {
        elBuDewi = document.createElement("div");
        elBuDewi.id = "wadah-tanggungan-budewi";
        elBuDewi.style.marginTop = "32px";
        elBuDewi.style.padding = "24px";
        elBuDewi.style.background = "#ffffff";
        elBuDewi.style.border = "1px solid #fed7aa";
        elBuDewi.style.borderRadius = "16px";
        elBuDewi.style.boxShadow = "0 4px 20px rgba(245, 158, 11, 0.08)";
        wadahTabelUtama.appendChild(elBuDewi);
      }

      elBuDewi.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
          <div>
            <h3 style="color: #9a3412; margin:0; font-size:18px; font-weight:700; display:flex; align-items:center; gap:8px;">
              👑 Rekapitulasi Pembayaran & Kekurangan ke Bu Dewi
            </h3>
            <p style="color:#78350f; font-size:13px; margin-top:4px;">
              Monitoring dana talangan owner dan riwayat pengembalian restoran.
            </p>
          </div>
        </div>

        <div class="tabel-responsif" style="margin-bottom: 24px; border: 1px solid #ffedd5; border-radius: 12px; overflow-x: auto;">
          <table class="tabel-transaksi-modern" style="width:100%; border-collapse:collapse; min-width: 600px;">
            <thead>
              <tr style="background: #fff7ed; border-bottom: 2px solid #ffedd5;">
                <th style="padding: 14px 18px; text-align: left; color: #9a3412; font-weight: 700; font-size: 13.5px;">Status Kategori</th>
                <th style="padding: 14px 18px; text-align: right; color: #9a3412; font-weight: 700; font-size: 13.5px;">Total Belanja Ditalangi Bu Dewi</th>
                <th style="padding: 14px 18px; text-align: right; color: #9a3412; font-weight: 700; font-size: 13.5px;">Total Sudah Dibayarkan</th>
                <th style="padding: 14px 18px; text-align: right; color: #9a3412; font-weight: 700; font-size: 13.5px;">SISA KEKURANGAN PEMBAYARAN</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background: #ffffff;">
                <td style="padding: 16px 18px; font-weight: 700; color: #1e293b;">Tanggungan Restoran</td>
                <td style="padding: 16px 18px; text-align: right; font-weight: 600; color: #334155; font-size: 15px;">Rp ${totalDitalangiBuDewi.toLocaleString("id-ID")}</td>
                <td style="padding: 16px 18px; text-align: right; font-weight: 700; color: #16a34a; font-size: 15px;">Rp ${totalSudahDibayarBuDewi.toLocaleString("id-ID")}</td>
                <td style="padding: 16px 18px; text-align: right;">
                  <span class="badge-kekurangan-budewi">
                    Rp ${Math.max(0, sisaKekuranganBuDewi).toLocaleString("id-ID")}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 style="color: #9a3412; margin: 20px 0 12px 0; font-size: 15.5px; font-weight: 700; display:flex; align-items:center; gap:6px;">
          📜 Riwayat Pembayaran ke Bu Dewi
        </h4>
        <div class="tabel-responsif" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow-x: auto;">
          <table class="tabel-transaksi-modern" style="width:100%; border-collapse:collapse; min-width: 550px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px 16px; text-align: center; color: #475569; font-weight: 700; width: 60px;">No</th>
                <th style="padding: 12px 16px; text-align: left; color: #475569; font-weight: 700;">Tanggal Pembayaran</th>
                <th style="padding: 12px 16px; text-align: right; color: #475569; font-weight: 700;">Jumlah Dibayarkan</th>
                <th style="padding: 12px 16px; text-align: left; color: #475569; font-weight: 700;">Keterangan</th>
              </tr>
            </thead>
            <tbody id="isi-tabel-bayar-budewi"></tbody>
          </table>
        </div>
      `;

      const tbodyBayarBuDewi = document.getElementById(
        "isi-tabel-bayar-budewi",
      );
      if (tbodyBayarBuDewi) {
        const dataBayar = dataRiwayat.filter(
          (t) => t.kategori === "bayar_owner",
        );
        if (dataBayar.length === 0) {
          tbodyBayarBuDewi.innerHTML = `<tr><td colspan="4" class="tabel-kosong" style="text-align:center; padding:20px; color:#94a3b8; font-size:13.5px;">Belum ada riwayat pembayaran ke Bu Dewi.</td></tr>`;
        } else {
          tbodyBayarBuDewi.innerHTML = dataBayar
            .map(
              (t, i) => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 16px; text-align: center; color: #64748b; font-weight:600;">${i + 1}</td>
              <td style="padding: 12px 16px; text-align: left; font-weight:600; color:#1e293b;">${t.tanggal}</td>
              <td style="padding: 12px 16px; text-align: right; font-weight:700; color:#16a34a; font-size:14.5px;">Rp ${bersihkanNominal(t.jumlah).toLocaleString("id-ID")}</td>
              <td style="padding: 12px 16px; text-align: left; color:#475569; font-size:13.5px;">${t.keterangan || "Pembayaran ke Bu Dewi"}</td>
            </tr>
          `,
            )
            .join("");
        }
      }
    }

    // Detail Transaksi Satuan
    if (
      wadahTabelUtama &&
      !document.getElementById("wadah-tabel-riwayat-satuan")
    ) {
      const elemenRiwayat = document.createElement("div");
      elemenRiwayat.id = "wadah-tabel-riwayat-satuan";
      elemenRiwayat.style.marginTop = "35px";
      elemenRiwayat.style.paddingTop = "20px";
      elemenRiwayat.style.borderTop = "2px dashed #cbd5e1";

      elemenRiwayat.innerHTML = `
        <h3>📜 Detail Riwayat Input Transaksi Satuan</h3>
        <div class="tabel-responsif" style="margin-top: 12px;">
          <table class="tabel-transaksi">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th class="rata-kanan">Nominal</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="isi-tabel-riwayat"></tbody>
          </table>
        </div>
      `;
      wadahTabelUtama.appendChild(elemenRiwayat);
    }

    const tbodyRiwayat = document.getElementById("isi-tabel-riwayat");
    if (tbodyRiwayat) {
      if (dataRiwayat.length === 0) {
        tbodyRiwayat.innerHTML = `<tr><td colspan="7" class="tabel-kosong">Belum ada transaksi satuan baru yang diinput.</td></tr>`;
      } else {
        tbodyRiwayat.innerHTML = dataRiwayat
          .map((t, i) => {
            const nominalFormatted = bersihkanNominal(t.jumlah);
            const warna =
              t.jenis === "masuk" ? "color:#16a34a;" : "color:#dc2626;";
            const jenisTeks = t.jenis === "masuk" ? "🟢 MASUK" : "🔴 KELUAR";
            return `
            <tr>
              <td>${i + 1}</td>
              <td>${t.tanggal}</td>
              <td>${jenisTeks}</td>
              <td>${t.kategori || "-"}</td>
              <td class="rata-kanan" style="font-weight:bold; ${warna}">Rp ${nominalFormatted.toLocaleString("id-ID")}</td>
              <td style="max-width:280px; font-size:12px;">${t.keterangan || "—"}</td>
              <td>
                <button class="btn-hapus-firebase" data-id="${t.idFirebase}" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">🗑️ Hapus</button>
              </td>
            </tr>
          `;
          })
          .join("");

        document.querySelectorAll(".btn-hapus-firebase").forEach((btn) => {
          btn.onclick = (e) => {
            const id = e.target.dataset.id;
            window.tampilkanKonfirmasi(
              "Yakin ingin menghapus transaksi ini dari database?",
              () => {
                remove(ref(db, `transaksi/${id}`))
                  .then(() =>
                    window.tampilkanNotifikasi(
                      "berhasil",
                      "Transaksi berhasil dihapus!",
                    ),
                  )
                  .catch((err) =>
                    window.tampilkanNotifikasi(
                      "error",
                      "Gagal menghapus: " + err.message,
                    ),
                  );
              },
            );
          };
        });
      }
    }

    if (elWaktu) {
      const skr = new Date();
      elWaktu.innerText = `${skr.getDate()}/${skr.getMonth() + 1}/${skr.getFullYear()}, ${String(skr.getHours()).padStart(2, "0")}:${String(skr.getMinutes()).padStart(2, "0")}`;
    }

    // Refresh otomatis jika pengguna sedang membuka tab tabungan atau laporan
    const wadahFitur = document.getElementById("wadah-konten-fitur");
    if (wadahFitur && window.menuAktifSaatIni === "tabungan" && typeof window.renderTabungan === "function") {
      window.renderTabungan(wadahFitur);
    } else if (wadahFitur && window.menuAktifSaatIni === "laporan" && typeof window.renderLaporan === "function") {
      const filterEl = document.getElementById("filter-bulan-laporan");
      const bln = filterEl ? filterEl.value : undefined;
      window.renderLaporan(wadahFitur, bln);
    }
  });
}

// ==============================================
// SIMPAN DATA KE FIREBASE
// ==============================================
window.simpanTransaksiKeFirebase = function (data) {
  const transaksiRef = ref(db, "transaksi");
  const newRef = push(transaksiRef);
  return set(newRef, {
    ...data,
    timestamp: Date.now(),
  });
};

// ==============================================
// INISIALISASI & EVENT LISTENERS
// ==============================================
document.addEventListener("DOMContentLoaded", function () {
  const PASSWORD = { manajer: "Esa91", owner: "owner123" };
  let roleYangDipilih = null;

  document.addEventListener("click", (e) => {
    const tombolRole = e.target.closest(".tombol-role");
    if (tombolRole) {
      document
        .querySelectorAll(".tombol-role")
        .forEach((t) => t.classList.remove("aktif"));
      tombolRole.classList.add("aktif");
      roleYangDipilih = tombolRole.dataset.role;
    }
  });

  const tombolMasuk = document.getElementById("tombol-masuk");
  if (tombolMasuk) {
    tombolMasuk.addEventListener("click", () => {
      const pw = document.getElementById("password").value.trim();
      if (!roleYangDipilih)
        return window.tampilkanNotifikasi(
          "warning",
          "Silakan pilih dulu: Manajer atau Owner",
        );
      if (!pw)
        return window.tampilkanNotifikasi(
          "warning",
          "Masukkan password terlebih dahulu",
        );

      if (pw === PASSWORD[roleYangDipilih]) {
        window.tampilkanNotifikasi(
          "berhasil",
          "Berhasil masuk sebagai " + roleYangDipilih.toUpperCase(),
        );
        localStorage.setItem("roleAktif", roleYangDipilih);

        setTimeout(() => {
          document.getElementById("halaman-login").style.display = "none";
          document.getElementById("halaman-utama").style.display = "block";
          document.body.classList.add("logged-in");

          const labelRole = document.getElementById("label-role");
          const sapaan = document.getElementById("sapaan-user");
          const pesan = document.getElementById("pesan-user");

          if (labelRole) {
            labelRole.innerHTML =
              roleYangDipilih === "manajer"
                ? "👨‍💼 Esa (Manajer)"
                : "👑 Bu Dewi (Owner)";
            labelRole.className = `chip-role chip-${roleYangDipilih}`;
          }
          if (sapaan)
            sapaan.textContent =
              roleYangDipilih === "manajer"
                ? "Selamat datang, Esa😊"
                : "Selamat datang, Bu Dewi😊";
          if (pesan)
            pesan.textContent =
              "Akses penuh: input transaksi, atur tabungan, ubah data, lihat laporan.";

          muatDashboardUtama();
        }, 650);
      } else {
        window.tampilkanNotifikasi("error", "Password salah! Coba lagi");
        document.getElementById("password").value = "";
      }
    });
  }

  document.getElementById("password")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tombolMasuk?.click();
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("#tombol-keluar")) {
      window.tampilkanKonfirmasi(
        "Yakin ingin keluar?",
        () => {
          window.tampilkanNotifikasi("info", "Sedang keluar...");
          localStorage.removeItem("roleAktif");
          setTimeout(() => window.location.reload(), 500);
        },
        "Ya, Keluar",
      );
    }
  });

  // NAVIGASI MENU UTAMA (PERBAIKAN FITUR / KONTEN)
  document.addEventListener("click", (e) => {
    const tombol = e.target.closest(".tombol-menu");
    if (!tombol) return;

    document
      .querySelectorAll("#menu-utama .tombol-menu")
      .forEach((m) => m.classList.remove("aktif"));
    tombol.classList.add("aktif");

    const menu = tombol.dataset.menu;
    window.menuAktifSaatIni = menu;

    const sapaan = document.getElementById("sapaan-user");
    const pesan = document.getElementById("pesan-user");
    const elRingkasan = document.getElementById("ringkasan-keuangan");
    const elWadahTabel = document.getElementById("wadah-tabel-transaksi");

    let wadahFitur = document.getElementById("wadah-konten-fitur");
    if (!wadahFitur) {
      const wadahKontenUtama =
        document.querySelector(".bungkus-konten") ||
        document.getElementById("konten-utama") ||
        document.body;
      wadahFitur = document.createElement("div");
      wadahFitur.id = "wadah-konten-fitur";
      wadahKontenUtama.appendChild(wadahFitur);
    }

    switch (menu) {
      case "dashboard":
        wadahFitur.style.display = "none";
        wadahFitur.innerHTML = "";
        const roleSaatIni = localStorage.getItem("roleAktif");
        if (sapaan)
          sapaan.textContent =
            roleSaatIni === "owner"
              ? "Selamat datang, Bu Dewi😊"
              : "Selamat datang, Esa😊";
        if (pesan)
          pesan.textContent = "Ringkasan arus kas & laporan harian lengkap.";
        if (elRingkasan) elRingkasan.style.display = "grid";
        if (elWadahTabel) elWadahTabel.style.display = "block";
        muatDashboardUtama();
        break;

      case "transaksi":
        if (elRingkasan) elRingkasan.style.display = "none";
        if (elWadahTabel) elWadahTabel.style.display = "none";
        wadahFitur.style.display = "block";
        wadahFitur.innerHTML = "";
        if (sapaan) sapaan.textContent = "👌 Semangat Dan Teliti 💪";
        if (pesan)
          pesan.textContent =
            "Jangan lupa catat semua transaksi harian agar laporan keuangan akurat.";
        if (typeof window.renderFormTransaksi === "function") {
          window.renderFormTransaksi(wadahFitur);
        }
        break;

      case "tabungan":
        if (elRingkasan) elRingkasan.style.display = "none";
        if (elWadahTabel) elWadahTabel.style.display = "none";
        wadahFitur.style.display = "block";
        wadahFitur.innerHTML = "";
        if (sapaan) sapaan.textContent = "🏦 Pengelolaan Tabungan";
        if (pesan) pesan.textContent = "Sisihkan uang ke pos wajib.";
        if (typeof window.renderTabungan === "function") {
          window.renderTabungan(wadahFitur);
        }
        break;

      case "laporan":
        if (elRingkasan) elRingkasan.style.display = "none";
        if (elWadahTabel) elWadahTabel.style.display = "none";
        wadahFitur.style.display = "block";
        wadahFitur.innerHTML = "";
        if (sapaan) sapaan.textContent = "📊 Laporan Bulanan";
        if (pesan)
          pesan.textContent = "Rekap data harian jadi laporan siap cetak.";
        if (typeof window.renderLaporan === "function") {
          window.renderLaporan(wadahFitur);
        }
        break;
    }
  });

  const roleTersimpan = localStorage.getItem("roleAktif");
  if (roleTersimpan) {
    roleYangDipilih = roleTersimpan;
    document.getElementById("halaman-login").style.display = "none";
    document.getElementById("halaman-utama").style.display = "block";

    const labelRole = document.getElementById("label-role");
    const sapaan = document.getElementById("sapaan-user");
    const pesan = document.getElementById("pesan-user");

    if (labelRole) {
      labelRole.innerHTML =
        roleTersimpan === "manajer" ? "👨‍💼 Esa (Manajer)" : "👑 Bu Dewi (Owner)";
      labelRole.className = `chip-role chip-${roleTersimpan}`;
    }
    if (sapaan)
      sapaan.textContent =
        roleTersimpan === "owner"
          ? "Selamat datang, Bu Dewi😊"
          : "Selamat datang, Esa😊";
    if (pesan)
      pesan.textContent = "Ringkasan arus kas & laporan harian lengkap.";

    muatDashboardUtama();
  }
});
