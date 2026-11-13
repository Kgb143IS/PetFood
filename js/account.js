/* account.js - nạp ở tai-khoan.html và don-hang.html */

var mauTrangThai = {
  "Chờ xác nhận": "warning",
  "Đang giao": "info",
  "Hoàn thành": "success",
  "Đã hủy": "secondary",
};
var donChoHuy = "";

/* ---------- Hồ sơ ---------- */
// Trang tài khoản luôn truy cập được: chưa đăng nhập -> chỉ nút Đăng nhập/Đăng ký,
// đã đăng nhập -> hiện hồ sơ
function veTrangTaiKhoan() {
  $("#khungKhach").toggleClass("d-none", !!nguoiDung);
  $("#khungHoSo").toggleClass("d-none", !nguoiDung);
  if (nguoiDung) veHoSo();
}

function veHoSo() {
  $("#hoSoAnhDaiDien").text(nguoiDung.name.charAt(0).toUpperCase());
  $("#hoSoHoTen").text(nguoiDung.name);
  $("#hoSoTaiKhoan").text(nguoiDung.login);
  $("#hoSoSdt").text(nguoiDung.phone || "Chưa cập nhật");
  $("#hoSoDiaChi").text(nguoiDung.address || "Chưa cập nhật");
}

/* ---------- Đơn hàng ---------- */
function timDonHang(ma) {
  for (var i = 0; i < donHang.length; i++) {
    if (donHang[i].code === ma) return donHang[i];
  }
  return null;
}

function veDonHang() {
  var boLoc = $("#locDonHang").val();
  var danhSach = donHang.filter(function (o) {
    return !boLoc || o.status === boLoc;
  });
  if (danhSach.length === 0) {
    $("#dsDonHang").html(
      '<div class="text-center text-muted py-5">Không có đơn hàng.</div>',
    );
    return;
  }

  var cacDong = "",
    cacThe = "";
  for (var i = 0; i < danhSach.length; i++) {
    var o = danhSach[i];
    var huyHieu =
      '<span class="badge bg-' + mauTrangThai[o.status] + '">' +
      o.status +
      "</span>";
    var nutHuy =
      o.status === "Chờ xác nhận"
        ? '<button class="btn btn-sm btn-outline-danger btn-cancel-order" data-code="' +
          o.code +
          '">Hủy đơn</button>'
        : "";
    var nutChiTiet =
      '<button class="btn btn-sm btn-outline-success btn-order-detail" data-code="' +
      o.code +
      '">Chi tiết</button>';
    cacDong +=
      "<tr><td>" +
      o.code +
      "</td><td>" +
      o.date +
      "</td><td>" +
      dinhDangTien(o.total) +
      "</td><td>" +
      huyHieu +
      '</td><td class="d-flex gap-1">' +
      nutChiTiet +
      nutHuy +
      "</td></tr>";
    cacThe +=
      '<div class="card card-body mb-2"><b>' +
      o.code +
      "</b> " +
      huyHieu +
      "<div>" +
      o.date +
      " · " +
      dinhDangTien(o.total) +
      '</div><div class="d-flex gap-1 mt-2">' +
      nutChiTiet +
      nutHuy +
      "</div></div>";
  }
  $("#dsDonHang").html(
    '<table class="table d-none d-md-table"><thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      cacDong +
      '</tbody></table><div class="d-md-none">' +
      cacThe +
      "</div>",
  );
}

$(function () {
  if ($("#hoSoHoTen").length) {
    khiDoiTrangThaiDangNhap = veTrangTaiKhoan;
    veTrangTaiKhoan();
  }
  $("#nutMoDangNhap").on("click", function () {
    moModal("modalDangNhap");
  });
  if ($("#dsDonHang").length) {
    if (batBuocDangNhap()) donHangSanSang.always(veDonHang);
  }

  // Hồ sơ
  $("#nutSuaHoSo").on("click", function () {
    $("#bieuMauHoSo").removeClass("was-validated");
    $("#suaHoTen").val(nguoiDung.name);
    $("#suaSdt").val(nguoiDung.phone);
    $("#suaDiaChi").val(nguoiDung.address);
    moModal("modalHoSo");
  });
  $("#nutDoiMatKhau").on("click", function () {
    hienThongBao("Tính năng đổi mật khẩu (demo)");
  });
  $("#bieuMauHoSo").on("submit", function (e) {
    e.preventDefault();
    $(this).addClass("was-validated");
    if (!this.checkValidity()) return;
    nguoiDung.name = $("#suaHoTen").val();
    nguoiDung.phone = $("#suaSdt").val();
    nguoiDung.address = $("#suaDiaChi").val();
    luuTatCa();
    veHoSo();
    dongModal("modalHoSo");
    hienThongBao("Đã lưu thay đổi");
  });

  // Đơn hàng
  $("#locDonHang").on("change", veDonHang);
  $(document).on("click", ".btn-order-detail", function () {
    hienThongBao(timDonHang($(this).data("code")).items);
  });
  $(document).on("click", ".btn-cancel-order", function () {
    donChoHuy = $(this).data("code");
    $("#maDonHuy").text(donChoHuy);
    moModal("modalHuyDon");
  });
  $("#nutXacNhanHuy").on("click", function () {
    timDonHang(donChoHuy).status = "Đã hủy";
    luuTatCa();
    veDonHang();
    dongModal("modalHuyDon");
    hienThongBao("Đã hủy đơn " + donChoHuy);
  });
});
