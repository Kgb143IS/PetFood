/* detail.js - chỉ nạp ở chi-tiet-san-pham.html */

function veChiTiet(id) {
  var p = timSanPham(id);
  if (!p) {
    chuyenTrang("home");
    return;
  }

  var tenLoai = p.type === "dog" ? "Thức ăn cho chó" : "Thức ăn cho mèo";
  $("#duongDanChiTiet").html(
    '<li class="breadcrumb-item"><a href="index.html">Trang chủ</a></li>' +
      '<li class="breadcrumb-item"><a href="san-pham.html?type=' +
      p.type +
      '">' +
      tenLoai +
      "</a></li>" +
      '<li class="breadcrumb-item active">' +
      p.name +
      "</li>",
  );
  document.title = "PetFood - " + p.name;

  // Sản phẩm liên quan: cùng loại (chó/mèo) với sản phẩm đang xem, bỏ chính nó
  var dsLienQuan = sanPham
    .filter(function (x) {
      return x.type === p.type && x.id !== p.id;
    })
    .slice(0, 4);
  var daThich = yeuThich.indexOf(p.id) >= 0;
  var giaCu = p.oldPrice
    ? ' <small class="text-muted text-decoration-line-through">' +
      dinhDangTien(p.oldPrice) +
      '</small> <span class="badge bg-danger">-' +
      Math.round((1 - p.price / p.oldPrice) * 100) +
      "%</span>"
    : "";
  var voHieu = p.stock ? "" : " disabled";

  var html =
    '<div class="row mb-4">' +
    '<div class="col-md-5 mb-3"><div class="d-flex align-items-center justify-content-center bg-success bg-opacity-10 overflow-hidden text-center rounded" style="height:300px;font-size:140px">' +
    anhSanPham(p, 300, "contain") +
    "</div></div>" +
    '<div class="col-md-7">' +
    "<h3>" +
    p.name +
    "</h3>" +
    '<p class="text-muted">Thương hiệu: ' +
    p.brand +
    " · Khối lượng: " +
    p.weight +
    " · Độ tuổi: " +
    p.age +
    "</p>" +
    '<h3 class="text-danger">' +
    dinhDangTien(p.price) +
    giaCu +
    "</h3>" +
    "<p>" +
    (p.stock
      ? '<span class="text-success">Còn hàng</span>'
      : '<span class="text-danger">Hết hàng</span>') +
    "</p>" +
    '<div class="input-group mb-3" style="width:140px"><button class="btn btn-outline-secondary" id="nutGiamSoLuong">-</button>' +
    '<input id="soLuongChiTiet" class="form-control text-center" value="1"><button class="btn btn-outline-secondary" id="nutTangSoLuong">+</button></div>' +
    '<div class="d-flex gap-2 flex-wrap">' +
    '<button class="btn btn-success btn-detail-add" data-id="' +
    p.id +
    '"' +
    voHieu +
    ">Thêm vào giỏ</button>" +
    '<button class="btn btn-danger btn-buy-now" data-id="' +
    p.id +
    '"' +
    voHieu +
    ">Mua ngay</button>" +
    '<button class="btn btn-outline-danger btn-heart" data-id="' +
    p.id +
    '">' +
    (daThich ? "❤️" : "🤍") +
    " Yêu thích</button>" +
    "</div></div></div>" +
    '<div class="border rounded p-3 mb-4"><h5 class="fs-6 fw-bold">Mô tả sản phẩm</h5>' +
    "<b>Thành phần:</b> thịt, ngũ cốc, vitamin, khoáng chất.<br><b>Hướng dẫn dùng:</b> chia 2-3 bữa mỗi ngày theo cân nặng, luôn có nước sạch.</div>" +
    '<h5 class="mb-3">Sản phẩm liên quan</h5><div class="row g-3" id="luoiLienQuan"></div>';
  $("#khungChiTiet").html(html);
  veLuoi("#luoiLienQuan", dsLienQuan, "col-6 col-lg-3");
  veDanhGia(p.id);
}

/* ---------- Đánh giá sản phẩm ---------- */
// Đánh giá của người dùng lưu trong localStorage ("reviews": {idSanPham: [...]}), kèm 2 đánh giá mẫu
var DANH_GIA_MAU = [
  { ten: "Lan", sao: 5, noiDung: "Bé nhà mình rất thích!", ngay: "12/10/2026" },
  { ten: "Minh", sao: 4, noiDung: "Đóng gói kỹ, giao nhanh.", ngay: "05/10/2026" },
];

function layDanhGia(idSanPham) {
  var cuaNguoiDung = docDuLieu("reviews", {})[idSanPham] || [];
  return cuaNguoiDung.concat(DANH_GIA_MAU);
}

function chuoiSao(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function veDanhGia(idSanPham) {
  var ds = layDanhGia(idSanPham);
  var tong = 0;
  var dem = [0, 0, 0, 0, 0, 0];
  ds.forEach(function (d) {
    tong += d.sao;
    dem[d.sao]++;
  });
  var trungBinh = ds.length ? tong / ds.length : 0;

  $("#diemTrungBinh").text(trungBinh.toFixed(1));
  $("#saoTrungBinh").text(chuoiSao(Math.round(trungBinh)));
  $("#soDanhGia").text(ds.length);

  var $phanBo = $("#phanBoSao").empty();
  for (var s = 5; s >= 1; s--) {
    var phanTram = ds.length ? Math.round((dem[s] * 100) / ds.length) : 0;
    $phanBo.append(
      '<div class="d-flex align-items-center gap-2 small mb-1">' +
        '<span class="text-nowrap">' + s + " ★</span>" +
        '<div class="progress flex-grow-1" style="height:8px"><div class="progress-bar bg-warning" style="width:' + phanTram + '%"></div></div>' +
        '<span class="text-muted text-end" style="width:2rem">' + dem[s] + "</span></div>",
    );
  }

  // Tên và nội dung do người dùng nhập nên chèn bằng .text() để tránh chèn mã HTML
  var $ds = $("#dsDanhGia").empty();
  ds.forEach(function (d) {
    var $tren = $('<div class="d-flex justify-content-between"></div>')
      .append($("<strong></strong>").text(d.ten))
      .append($('<small class="text-muted"></small>').text(d.ngay));
    $ds.append(
      $('<div class="border-bottom py-3"></div>')
        .append($tren)
        .append($('<div class="text-warning"></div>').text(chuoiSao(d.sao)))
        .append($('<p class="mb-0"></p>').text(d.noiDung)),
    );
  });
}

khiSanSang(function () {
  veChiTiet(Number(layThamSo("id")));

  // Gửi đánh giá: cần đăng nhập, mỗi tài khoản một đánh giá cho mỗi sản phẩm (gửi lại sẽ thay thế)
  $("#bieuMauDanhGia").on("submit", function (e) {
    e.preventDefault();
    if (!yeuCauDangNhap()) return;
    var noiDung = $("#noiDungDanhGia").val().trim();
    if (!noiDung) {
      hienThongBao("Vui lòng nhập nội dung đánh giá");
      return;
    }
    var id = Number(layThamSo("id"));
    var tatCa = docDuLieu("reviews", {});
    var cuaNguoiDung = (tatCa[id] || []).filter(function (d) {
      return d.taiKhoan !== nguoiDung.login;
    });
    cuaNguoiDung.unshift({
      ten: nguoiDung.name,
      taiKhoan: nguoiDung.login,
      sao: Number($("input[name=saoDanhGia]:checked").val()),
      noiDung: noiDung,
      ngay: new Date().toLocaleDateString("vi-VN"),
    });
    tatCa[id] = cuaNguoiDung;
    localStorage.setItem("reviews", JSON.stringify(tatCa));
    $("#noiDungDanhGia").val("");
    veDanhGia(id);
    hienThongBao("Cảm ơn bạn đã đánh giá!");
  });

  $(document).on("click", "#nutTangSoLuong", function () {
    $("#soLuongChiTiet").val(Number($("#soLuongChiTiet").val()) + 1);
  });
  $(document).on("click", "#nutGiamSoLuong", function () {
    var q = Number($("#soLuongChiTiet").val());
    if (q > 1) $("#soLuongChiTiet").val(q - 1);
  });
  $(document).on("click", ".btn-detail-add", function () {
    themVaoGioHang($(this).data("id"), Number($("#soLuongChiTiet").val()) || 1);
  });
  $(document).on("click", ".btn-buy-now", function () {
    if (themVaoGioHang($(this).data("id"), Number($("#soLuongChiTiet").val()) || 1))
      chuyenTrang("checkout");
  });
});
