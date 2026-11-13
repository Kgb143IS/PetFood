/* cart.js - nạp ở gio-hang.html, thanh-toan.html, dat-hang-thanh-cong.html
   Mỗi hàm tự kiểm tra phần tử của trang mình nên dùng chung 1 file. */

function doiSoLuong(id, chenhLech) {
  for (var i = 0; i < gioHang.length; i++) {
    if (gioHang[i].id === id) {
      gioHang[i].qty += chenhLech;
      if (gioHang[i].qty < 1) gioHang[i].qty = 1;
    }
  }
  luuTatCa();
  veGioHang();
}

function tinhTong() {
  var tamTinh = 0;
  for (var i = 0; i < gioHang.length; i++)
    tamTinh += timSanPham(gioHang[i].id).price * gioHang[i].qty;
  var giamGia = Math.round((tamTinh * maGiamGia) / 100);
  var phiVanChuyen = tamTinh === 0 || tamTinh >= 500000 ? 0 : 30000;
  return {
    sub: tamTinh,
    discount: giamGia,
    ship: phiVanChuyen,
    total: tamTinh - giamGia + phiVanChuyen,
  };
}

/* ---------- Giỏ hàng ---------- */
function veGioHang() {
  if (gioHang.length === 0) {
    $("#gioHangCoHang").addClass("d-none");
    $("#gioHangTrong").removeClass("d-none");
    return;
  }
  $("#gioHangCoHang").removeClass("d-none");
  $("#gioHangTrong").addClass("d-none");
  var html = "";
  for (var i = 0; i < gioHang.length; i++) {
    var p = timSanPham(gioHang[i].id);
    html +=
      "<tr><td>" +
      p.icon +
      " " +
      p.name +
      "</td><td>" +
      dinhDangTien(p.price) +
      "</td>" +
      '<td><div class="input-group input-group-sm" style="width:110px">' +
      '<button class="btn btn-outline-secondary btn-qty" data-id="' +
      p.id +
      '" data-delta="-1">-</button>' +
      '<span class="form-control text-center">' +
      gioHang[i].qty +
      "</span>" +
      '<button class="btn btn-outline-secondary btn-qty" data-id="' +
      p.id +
      '" data-delta="1">+</button></div></td>' +
      "<td>" +
      dinhDangTien(p.price * gioHang[i].qty) +
      "</td>" +
      '<td><button class="btn btn-sm btn-outline-danger btn-remove" data-id="' +
      p.id +
      '">🗑</button></td></tr>';
  }
  $("#thanGioHang").html(html);
  var t = tinhTong();
  $("#tamTinhGioHang").text(dinhDangTien(t.sub));
  $("#giamGiaGioHang").text("-" + dinhDangTien(t.discount));
  $("#phiVanChuyenGioHang").text(t.ship === 0 ? "Miễn phí" : dinhDangTien(t.ship));
  $("#tongGioHang").text(dinhDangTien(t.total));
}

/* ---------- Thanh toán ---------- */
function veThanhToan() {
  if (gioHang.length === 0) {
    hienThongBao("Giỏ hàng đang trống");
    setTimeout(function () {
      chuyenTrang("cart");
    }, 600);
    return;
  }
  var html = "";
  for (var i = 0; i < gioHang.length; i++) {
    var p = timSanPham(gioHang[i].id);
    html +=
      '<div class="d-flex justify-content-between"><span>' +
      p.name +
      " x" +
      gioHang[i].qty +
      "</span><span>" +
      dinhDangTien(p.price * gioHang[i].qty) +
      "</span></div>";
  }
  var t = tinhTong();
  $("#dsSanPhamThanhToan").html(html);
  $("#phiVanChuyenThanhToan").text(t.ship === 0 ? "Miễn phí" : dinhDangTien(t.ship));
  $("#tongThanhToan").text(dinhDangTien(t.total));
  if (nguoiDung) {
    $("#hoTenThanhToan").val(nguoiDung.name);
    $("#sdtThanhToan").val(nguoiDung.phone);
    $("#diaChiThanhToan").val(nguoiDung.address);
  }
}

function datHang() {
  if (!yeuCauDangNhap()) return;
  var t = tinhTong();
  var chuoiSanPham = gioHang
    .map(function (c) {
      return timSanPham(c.id).name + " x" + c.qty;
    })
    .join(", ");
  donHangGanNhat = {
    code: "DH" + String(Date.now()).slice(-6),
    date: new Date().toLocaleString("vi-VN"),
    total: t.total,
    status: "Chờ xác nhận",
    items: chuoiSanPham,
    payment: $("input[name=pay]:checked").val(),
  };
  donHang.unshift(donHangGanNhat);
  gioHang = [];
  maGiamGia = 0;
  luuTatCa();
  chuyenTrang("success");
}

/* ---------- Đặt hàng thành công ---------- */
function veThanhCong() {
  if (!donHangGanNhat) {
    chuyenTrang("home");
    return;
  }
  $("#maDonThanhCong").text(donHangGanNhat.code);
  $("#ngayDatThanhCong").text(donHangGanNhat.date);
  $("#tongTienThanhCong").text(dinhDangTien(donHangGanNhat.total));
  $("#thanhToanThanhCong").text(donHangGanNhat.payment);
}

khiSanSang(function () {
  // Khởi tạo theo trang đang mở (cần dữ liệu sản phẩm)
  if ($("#thanGioHang").length) veGioHang();
  if ($("#bieuMauThanhToan").length) veThanhToan();
  if ($("#maDonThanhCong").length) veThanhCong();
});

$(function () {
  // Giỏ hàng
  $(document).on("click", ".btn-qty", function () {
    doiSoLuong($(this).data("id"), $(this).data("delta"));
  });
  $(document).on("click", ".btn-remove", function () {
    var id = $(this).data("id");
    xacNhanXoa(
      'Xóa "' + timSanPham(id).name + '" khỏi giỏ hàng?',
      function () {
        gioHang = gioHang.filter(function (c) {
          return c.id !== id;
        });
        luuTatCa();
        veGioHang();
      },
    );
  });
  $("#nutMaGiamGia").on("click", function () {
    if ($("#oMaGiamGia").val().trim().toUpperCase() === "PET10") {
      maGiamGia = 10;
      hienThongBao("Áp dụng mã giảm 10%");
    } else {
      maGiamGia = 0;
      hienThongBao("Mã giảm giá không hợp lệ");
    }
    luuTatCa();
    veGioHang();
  });

  // Thanh toán
  $("#bieuMauThanhToan").on("submit", function (e) {
    e.preventDefault();
    $(this).addClass("was-validated");
    if (this.checkValidity()) datHang();
  });
});
