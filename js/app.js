// Chức năng của file chung: Tải các thành phần HTML dùng chung và nội dung từng trang.

// 1. Đọc dữ liệu sản phẩm từ products.json và kiểm tra việc tải dữ liệu.
var DUONG_DAN_DU_LIEU = "../json/";
function taiJSON(tep) {
  return $.getJSON(DUONG_DAN_DU_LIEU + tep);
}

var sanPham = [];
var sanPhamSanSang = taiJSON("products.json")
  .done(function (duLieu) {
    sanPham = duLieu;
  })
  .fail(function () {
    console.error("Không đọc được " + DUONG_DAN_DU_LIEU + "products.json");
  });

// Các trang cần dữ liệu sản phẩm dùng khiSanSang thay cho $(function(){...})
function khiSanSang(ham) {
  $(function () {
    sanPhamSanSang.done(ham).fail(function () {
      $("main").prepend(
        '<div class="container py-4"><div class="alert alert-danger">Không tải được dữ liệu sản phẩm.',
      );
    });
  });
}

// 2. Quản lý giỏ hàng, yêu thích, tài khoản, đơn hàng, mã giảm giá và đơn hàng gần nhất -> localStorage
function docDuLieu(khoa, giaTriMacDinh) {
  var chuoi = localStorage.getItem(khoa);
  return chuoi ? JSON.parse(chuoi) : giaTriMacDinh;
}
var nguoiDung = docDuLieu("user", null); // {name, login, phone, address}
// Giỏ hàng và yêu thích chỉ dùng khi đã đăng nhập; chưa đăng nhập thì coi như rỗng
// (dữ liệu cũ vẫn nằm trong localStorage, đăng nhập xong sẽ hiện lại)
var gioHang = nguoiDung ? docDuLieu("cart", []) : []; // [{id, qty}]
var yeuThich = nguoiDung ? docDuLieu("wish", []) : []; // [id, ...]
var donHang = docDuLieu("orders", []);
// Chưa có đơn nào trong localStorage thì nạp đơn mẫu từ orders.json
var donHangSanSang =
  donHang.length > 0
    ? $.Deferred().resolve().promise()
    : taiJSON("orders.json")
        .done(function (duLieu) {
          donHang = duLieu;
          luuTatCa();
        })
        .fail(function () {
          console.error("Không đọc được " + DUONG_DAN_DU_LIEU + "orders.json");
        });
var maGiamGia = docDuLieu("coupon", 0); // % giảm giá
var donHangGanNhat = docDuLieu("lastOrder", null);

function luuTatCa() {
  if (nguoiDung) {
    localStorage.setItem("cart", JSON.stringify(gioHang));
    localStorage.setItem("wish", JSON.stringify(yeuThich));
  }
  localStorage.setItem("user", JSON.stringify(nguoiDung));
  localStorage.setItem("orders", JSON.stringify(donHang));
  localStorage.setItem("coupon", JSON.stringify(maGiamGia));
  localStorage.setItem("lastOrder", JSON.stringify(donHangGanNhat));
  capNhatHeader();
}

// 3. Định dạng tiền, tìm sản phẩm, lấy tham số URL, hiển thị thông báo, mở/đóng modal và cập nhật header.
function dinhDangTien(n) {
  return n.toLocaleString("vi-VN") + "đ";
}

function timSanPham(id) {
  for (var i = 0; i < sanPham.length; i++) {
    if (sanPham[i].id === id) return sanPham[i];
  }
  return null;
}

function layThamSo(ten) {
  return new URLSearchParams(location.search).get(ten);
}

function hienThongBao(thongDiep) {
  $("#thanThongBao").text(thongDiep);
  bootstrap.Toast.getOrCreateInstance($("#thongBao")[0]).show();
}
function moModal(id) {
  bootstrap.Modal.getOrCreateInstance($("#" + id)[0]).show();
}
function dongModal(id) {
  bootstrap.Modal.getOrCreateInstance($("#" + id)[0]).hide();
}

function capNhatHeader() {
  var totalQty = 0;
  for (var i = 0; i < gioHang.length; i++) totalQty += gioHang[i].qty;
  $("#soLuongGioHang").text(totalQty);
  $("#soLuongYeuThich").text(yeuThich.length);
  $("#tenTaiKhoan").text(nguoiDung ? nguoiDung.name : "👤 Tài khoản");
}

// hiệu ứng load dữ liệu
var bieuTuongTai =
  '<div class="text-center py-5 w-100"><div class="spinner-border text-success"></div></div>';

// 4. Đường dẫn các trang chuyển bằng JS (link cố định đã viết thẳng href trong HTML), kiểm tra đăng nhập, tô sáng menu.
var DUONG_DAN_TRANG = {
  home: "index.html",
  checkout: "thanh-toan.html",
  success: "dat-hang-thanh-cong.html",
  profile: "tai-khoan.html",
  wishlist: "yeu-thich.html",
  articles: "bai-viet.html",
};

function layDuongDan(trang, thamSo) {
  if (trang === "dog" || trang === "cat") return "san-pham.html?type=" + trang;
  if (trang === "search") return "san-pham.html?q=" + encodeURIComponent(thamSo);
  if (trang === "detail") return "chi-tiet-san-pham.html?id=" + thamSo;
  if (trang === "article") return "chi-tiet-bai-viet.html?id=" + thamSo;
  return DUONG_DAN_TRANG[trang] || "index.html";
}

function chuyenTrang(trang, thamSo) {
  location.href = layDuongDan(trang, thamSo);
}

// Trang cần đăng nhập gọi hàm này khi khởi tạo
function batBuocDangNhap() {
  if (nguoiDung) return true;
  location.href = DUONG_DAN_TRANG.profile;
  return false;
}

// Tô sáng menu theo URL hiện tại
function toSangMenu() {
  var tep = location.pathname.split("/").pop() || "index.html";
  var viTriHienTai = tep + location.search;
  $(".main-nav .nav-link").each(function () {
    var duongDan = $(this).attr("href");
    $(this).toggleClass(
      "active",
      duongDan === viTriHienTai || (duongDan.indexOf("?") < 0 && duongDan === tep),
    );
  });
}

// 5. Tạo giao diện thẻ sản phẩm và hiển thị danh sách sản phẩm.
function anhSanPham(p, chieuCao, kieuVua) {
  if (!p.image) return p.icon;
  return (
    '<img src="' +
    encodeURI(p.image) +
    '" alt="' +
    p.name +
    '" ' +
    'style="display:block;width:100%;height:' +
    (chieuCao || 180) +
    'px;object-fit:' +
    (kieuVua || "cover") +
    '" ' +
    "onerror=\"this.style.display='none';this.nextElementSibling.style.display='inline'\">" +
    '<span style="display:none">' +
    p.icon +
    "</span>"
  );
}
function theSanPham(p, lopCot) {
  var daThich = yeuThich.indexOf(p.id) >= 0;
  var giaCu = p.oldPrice
    ? ' <small class="text-muted text-decoration-line-through">' +
      dinhDangTien(p.oldPrice) +
      "</small>"
    : "";
  var conHang = p.stock
    ? '<small class="text-success">Còn hàng</small>'
    : '<small class="text-danger">Hết hàng</small>';
  var voHieu = p.stock ? "" : " disabled";
  return (
    '<div class="' + lopCot + '"><div class="card shadow-sm h-100">' +
    '<div class="d-flex align-items-center justify-content-center bg-success bg-opacity-10 overflow-hidden text-center" role="button" style="height:180px;font-size:72px" data-page="detail" data-arg="' +
    p.id +
    '">' +
    anhSanPham(p) +
    "</div>" +
    '<div class="card-body d-flex flex-column">' +
    '<small class="text-muted">' +
    p.brand +
    " · " +
    p.weight +
    "</small>" +
    '<h6 data-page="detail" data-arg="' +
    p.id +
    '">' +
    p.name +
    "</h6>" +
    '<div class="text-danger fw-bold">' +
    dinhDangTien(p.price) +
    giaCu +
    "</div>" +
    conHang +
    '<div class="d-flex gap-1 mt-auto pt-2">' +
    '<button class="btn btn-success btn-sm flex-grow-1 btn-add" data-id="' +
    p.id +
    '"' +
    voHieu +
    ">Thêm giỏ</button>" +
    '<button class="btn btn-outline-secondary btn-sm btn-quick" data-id="' +
    p.id +
    '">👁</button>' +
    '<button class="btn btn-outline-danger btn-sm btn-heart" data-id="' +
    p.id +
    '">' +
    (daThich ? "❤️" : "🤍") +
    "</button>" +
    "</div></div></div></div>"
  );
}

//Nếu k có sp thì hiển thị không có sp phù hợp
function veLuoi(boChon, danhSach, lopCot) {
  if (danhSach.length === 0) {
    $(boChon).html(
      '<div class="text-center text-muted py-5">Không có sản phẩm phù hợp.</div>',
    );
    return;
  }
  // hiển thị ds sp
  var html = "";
  for (var i = 0; i < danhSach.length; i++) html += theSanPham(danhSach[i], lopCot);
  $(boChon).html(html);
}

// Giỏ hàng, yêu thích và đặt hàng cần đăng nhập: chưa đăng nhập -> mở modal đăng nhập/đăng ký
function yeuCauDangNhap() {
  if (nguoiDung) return true;
  hienThongBao("Vui lòng đăng nhập để tiếp tục");
  var $modalDangMo = $(".modal.show"); // vd: modal xem nhanh đang mở thì đóng trước, tránh chồng 2 modal
  if ($modalDangMo.length) {
    $modalDangMo.one("hidden.bs.modal", function () {
      moModal("modalDangNhap");
    });
    bootstrap.Modal.getOrCreateInstance($modalDangMo[0]).hide();
  } else {
    moModal("modalDangNhap");
  }
  return false;
}

// 6. Thêm sản phẩm vào giỏ hàng và cập nhật dữ liệu giỏ hàng. Trả về true nếu thêm được.
function themVaoGioHang(id, soLuong) {
  if (!yeuCauDangNhap()) return false;
  var timThay = null;
  for (var i = 0; i < gioHang.length; i++) {
    if (gioHang[i].id === id) timThay = gioHang[i];
  }
  if (timThay) timThay.qty += soLuong;
  else gioHang.push({ id: id, qty: soLuong });
  luuTatCa();
  hienThongBao("Đã thêm vào giỏ hàng");
  return true;
}

// 7. Thêm hoặc bỏ sản phẩm khỏi danh sách yêu thích.
var khiBamTim = null;

function batTatYeuThich(id) {
  var viTri = yeuThich.indexOf(id);
  if (viTri >= 0) {
    yeuThich.splice(viTri, 1);
    hienThongBao("Đã bỏ khỏi yêu thích");
  } else {
    yeuThich.push(id);
    var p = timSanPham(id);
    $("#anhYeuThich").html(
      '<span class="fs-1">' + p.icon + "</span><div>" + p.name + "</div>",
    );
    moModal("modalYeuThich");
  }
  luuTatCa();
  $('.btn-heart[data-id="' + id + '"]').each(function () {
    var laNutChiTiet =
      $(this).hasClass("btn-outline-danger") &&
      $(this).text().indexOf("Yêu thích") >= 0;
    $(this).text(
      (yeuThich.indexOf(id) >= 0 ? "❤️" : "🤍") + (laNutChiTiet ? " Yêu thích" : ""),
    );
  });
}

// 8. Lưu thao tác cần thực hiện sau khi người dùng xác nhận xóa.
var viecChoXoa = null; // hàm sẽ chạy khi bấm "Xóa"
function xacNhanXoa(chuoi, khiXacNhan) {
  viecChoXoa = khiXacNhan;
  $("#noiDungXoa").text(chuoi);
  moModal("modalXoa");
}

// 9. Hiển thị nhanh thông tin sản phẩm và cho phép thêm vào giỏ hoặc xem chi tiết.
function moXemNhanh(id) {
  var p = timSanPham(id);
  $("#thanXemNhanh").html(
    '<div class="row"><div class="col-md-5"><div class="d-flex align-items-center justify-content-center bg-success bg-opacity-10 overflow-hidden text-center rounded" style="height:260px;font-size:100px">' +
      anhSanPham(p, 260) + // trước đây là p.icon
      "</div></div>" +
      '<div class="col-md-7"><h4>' +
      p.name +
      '</h4><h4 class="text-danger">' +
      dinhDangTien(p.price) +
      "</h4>" +
      "<p>" +
      p.brand +
      " · " +
      p.weight +
      " · " +
      p.age +
      ". Dinh dưỡng cân bằng cho thú cưng.</p>" +
      '<input id="soLuongXemNhanh" type="number" min="1" value="1" class="form-control mb-3" style="width:100px">' +
      '<button class="btn btn-success me-2 btn-qv-add" data-id="' +
      p.id +
      '"' +
      (p.stock ? "" : " disabled") +
      ">Thêm vào giỏ hàng</button>" +
      '<button class="btn btn-outline-success btn-qv-detail" data-id="' +
      p.id +
      '">Xem chi tiết</button></div></div>',
  );
  moModal("modalXemNhanh");
}

// 10. Tạo biểu mẫu, kiểm tra thông tin và xử lý đăng nhập, đăng ký, đăng xuất.

// Dữ liệu tài khoản và người dùng (lấy từ localStorage, lần đầu nạp từ JSON)
var dsDangNhap = [];
var dsNguoiDung = [];
var duLieuTaiKhoanSanSang = false;

function taiDuLieuTaiKhoan() {
  var dsDangNhapDaLuu = docDuLieu("logins", null);
  var dsNguoiDungDaLuu = docDuLieu("users", null);
  if (dsDangNhapDaLuu && dsNguoiDungDaLuu) {
    dsDangNhap = dsDangNhapDaLuu;
    dsNguoiDung = dsNguoiDungDaLuu;
    duLieuTaiKhoanSanSang = true;
    return;
  }
  $.when(taiJSON("logins.json"), taiJSON("users.json"))
    .done(function (duLieuDangNhap, duLieuNguoiDung) {
      dsDangNhap = duLieuDangNhap[0];
      dsNguoiDung = duLieuNguoiDung[0];
      luuDuLieuTaiKhoan();
    })
    .fail(function () {
      console.error("Không tải được logins.json hoặc users.json");
    })
    .always(function () {
      duLieuTaiKhoanSanSang = true;
    });
}

// Chuẩn hóa tài khoản để so sánh
function chuanHoaTaiKhoan(taiKhoan) {
  return String(taiKhoan || "").trim().toLowerCase();
}

// Kiểm tra email hoặc số điện thoại
// Quy tắc kiểm tra (regex) cho email và số điện thoại
var QUY_TAC = {
  email: {
    regex: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    placeholder: "Email (dạng ten@gmail.com)",
    loi: "Email không hợp lệ, phải có dạng ten@gmail.com",
  },
  sdt: {
    regex: /^0[0-9]{9}$/,
    placeholder: "Số điện thoại (phải đủ 10 số, bắt đầu bằng 0)",
    loi: "Số điện thoại phải đủ 10 số và bắt đầu bằng 0",
  },
};

function emailHopLe(email) {
  return QUY_TAC.email.regex.test(email);
}

function sdtHopLe(sdt) {
  return QUY_TAC.sdt.regex.test(sdt);
}

// Kiểm tra email hoặc số điện thoại (dùng cho ô đăng nhập)
function taiKhoanHopLe(taiKhoan) {
  return emailHopLe(taiKhoan) || sdtHopLe(taiKhoan);
}

// Lưu dữ liệu
function luuDuLieuTaiKhoan() {
  localStorage.setItem("logins", JSON.stringify(dsDangNhap));
  localStorage.setItem("users", JSON.stringify(dsNguoiDung));
}

// Tạo giao diện đăng nhập và đăng ký
function htmlDangNhap(tienTo) {
  var oNhapTaiKhoan =
    '<input class="form-control mb-2 auth-id" ' +
     'placeholder="Email hoặc số điện thoại (số điện thoại phải đủ 10 số)" required>' +
    '<div class="invalid-feedback">Nhập email hợp lệ hoặc số điện thoại đủ 10 số</div>';

  var oNhapMatKhau =
    '<input type="password" class="form-control mb-2 pw" ' +
    'placeholder="Mật khẩu (từ 6 ký tự)" minlength="6" required>' +
    '<div class="invalid-feedback">Mật khẩu tối thiểu 6 ký tự</div>';

  return (
    '<ul class="nav nav-tabs mb-3">' +
    '<li class="nav-item">' +
    '<button class="nav-link active" data-bs-toggle="tab" ' +
    'data-bs-target="#' +
    tienTo +
    'DangNhap">Đăng nhập</button>' +
    "</li>" +
    '<li class="nav-item">' +
    '<button class="nav-link" data-bs-toggle="tab" ' +
    'data-bs-target="#' +
    tienTo +
    'DangKy">Đăng ký</button>' +
    "</li>" +
    "</ul>" +
    '<div class="tab-content">' +
    // Form đăng nhập
    '<div class="tab-pane fade show active" id="' +
    tienTo +
    'DangNhap">' +
    '<form class="auth-form needs-validation" data-mode="login" novalidate>' +
    oNhapTaiKhoan +
    oNhapMatKhau +
    '<a href="#" class="d-block mb-2 link-forgot">Quên mật khẩu?</a>' +
    '<button class="btn btn-success w-100">Đăng nhập</button>' +
    "</form>" +
    "</div>" +
    // Form đăng ký
    '<div class="tab-pane fade" id="' +
    tienTo +
    'DangKy">' +
    '<form class="auth-form needs-validation" data-mode="register" novalidate>' +
    '<input class="form-control mb-2 auth-name" ' +
    'placeholder="Họ tên" required>' +
    '<div class="invalid-feedback">Vui lòng nhập họ tên</div>' +
   '<input class="form-control mb-2 auth-email" inputmode="email" autocomplete="email" ' +
    'placeholder="' + QUY_TAC.email.placeholder + '" required>' +
    '<div class="invalid-feedback">' + QUY_TAC.email.loi + '</div>' +
    '<input class="form-control mb-2 auth-phone" inputmode="tel" autocomplete="tel" ' +
    'placeholder="' + QUY_TAC.sdt.placeholder + '" required>' +
    '<div class="invalid-feedback">' + QUY_TAC.sdt.loi + '</div>' +
    '<input class="form-control mb-2 auth-address" ' +
    'placeholder="Địa chỉ" required>' +
    '<div class="invalid-feedback">Vui lòng nhập địa chỉ</div>' +
    oNhapMatKhau +
    '<input type="password" class="form-control mb-2 pw2" ' +
    'placeholder="Xác nhận mật khẩu" required>' +
    '<div class="invalid-feedback">Mật khẩu xác nhận không khớp</div>' +
    '<div class="form-check mb-2">' +
    '<input type="checkbox" class="form-check-input" required>' +
    '<label class="form-check-label">Tôi đồng ý với điều khoản sử dụng</label>' +
    "</div>" +
    '<button class="btn btn-success w-100">Đăng ký</button>' +
    "</form>" +
    "</div>" +
    "</div>"
  );
}

// Xử lý đăng nhập hoặc đăng ký
function xuLyDangNhap($bieuMau) {
  if (!duLieuTaiKhoanSanSang) {
    hienThongBao("Dữ liệu tài khoản đang được tải. Vui lòng thử lại.");
    return;
  }

  var cheDo = $bieuMau.data("mode");
   var taiKhoan = (cheDo === "login" ? $bieuMau.find(".auth-id") : $bieuMau.find(".auth-email"))
    .val()
    .trim();
  var matKhau = $bieuMau.find(".pw").val();

  // ĐĂNG NHẬP (bằng email hoặc số điện thoại)
  if (cheDo === "login") {
    var khoa = chuanHoaTaiKhoan(taiKhoan);
    var nguoiDungDangNhap = dsNguoiDung.find(function (muc) {
      return chuanHoaTaiKhoan(muc.login) === khoa || chuanHoaTaiKhoan(muc.phone) === khoa;
    });
    var taiKhoanTimThay =
      nguoiDungDangNhap &&
      dsDangNhap.find(function (muc) {
        return chuanHoaTaiKhoan(muc.username) === chuanHoaTaiKhoan(nguoiDungDangNhap.login);
      });

    if (!taiKhoanTimThay || taiKhoanTimThay.password !== matKhau) {
      hienThongBao("Tài khoản hoặc mật khẩu không đúng!");
      return;
    }

    nguoiDung = {
      name: nguoiDungDangNhap.name,
      login: nguoiDungDangNhap.login,
      phone: nguoiDungDangNhap.phone,
      address: nguoiDungDangNhap.address,
    };
    // Nạp lại giỏ hàng và yêu thích đã lưu (trước khi luuTatCa để không bị ghi đè bằng rỗng)
    gioHang = docDuLieu("cart", []);
    yeuThich = docDuLieu("wish", []);

    luuTatCa();
    hoanTatDangNhap($bieuMau);
    return;
  }

  // ĐĂNG KÝ
  var ten = $bieuMau.find(".auth-name").val().trim();
  var sdt = $bieuMau.find(".auth-phone").val().trim();
  var diaChi = $bieuMau.find(".auth-address").val().trim();

   if (!emailHopLe(taiKhoan)) {
    hienThongBao(QUY_TAC.email.loi + "!");
    return;
  }

  if (!sdtHopLe(sdt)) {
    hienThongBao(QUY_TAC.sdt.loi + "!");
    return;
  }

  // Kiểm tra tài khoản đã tồn tại
  var trungTaiKhoan = dsDangNhap.some(function (muc) {
    return chuanHoaTaiKhoan(muc.username) === chuanHoaTaiKhoan(taiKhoan);
  });

  if (trungTaiKhoan) {
    hienThongBao("Tài khoản đã tồn tại!");
    return;
  }

  // Kiểm tra số điện thoại đã được sử dụng
  var trungSdt = dsNguoiDung.some(function (muc) {
     return muc.phone === sdt || chuanHoaTaiKhoan(muc.login) === sdt;
  });

  if (trungSdt) {
    hienThongBao("Số điện thoại đã được đăng ký!");
    return;
  }

  // Thêm tài khoản và mật khẩu
  dsDangNhap.push({
    username: taiKhoan,
    password: matKhau,
  });

  // Thêm thông tin người dùng
  dsNguoiDung.push({
    name: ten,
    login: taiKhoan,
    phone: sdt,
    address: diaChi,
  });

  // Lưu vào localStorage
  luuDuLieuTaiKhoan();

  hienThongBao("Đăng ký thành công! Hãy đăng nhập.");

  // Chuyển sang tab đăng nhập
  $bieuMau[0].reset();
  $bieuMau.removeClass("was-validated");

  var tienTo = $bieuMau.closest(".tab-pane").attr("id").replace("DangKy", "");

  var tabDangNhap = document.querySelector(
    '[data-bs-target="#' + tienTo + 'DangNhap"]',
  );

  if (tabDangNhap) {
    bootstrap.Tab.getOrCreateInstance(tabDangNhap).show();
  }
}

// Trang nào cần vẽ lại khi đăng nhập/đăng xuất thì gán hàm vào đây (vd: tai-khoan.html)
var khiDoiTrangThaiDangNhap = null;

// Xử lý sau khi đăng nhập thành công
function hoanTatDangNhap($bieuMau) {
  var trongModal = $bieuMau.closest("#modalDangNhap").length > 0;

  if (trongModal) {
    dongModal("modalDangNhap");
    if (khiDoiTrangThaiDangNhap) khiDoiTrangThaiDangNhap();
    else setTimeout(function () { location.reload(); }, 600); // vẽ lại giỏ, tim theo dữ liệu đã đăng nhập
  }

  hienThongBao("Xin chào, " + nguoiDung.name + "!");

  if (!trongModal) {
    setTimeout(function () {
      chuyenTrang("home");
    }, 600);
  }
}

// Đăng xuất
function dangXuat() {
  nguoiDung = null;
  gioHang = [];
  yeuThich = [];
  localStorage.removeItem("user");

  capNhatHeader();
  hienThongBao("Đã đăng xuất");

  if (khiDoiTrangThaiDangNhap) {
    khiDoiTrangThaiDangNhap(); // ở lại trang, chỉ đổi giao diện
    return;
  }
  setTimeout(function () {
    chuyenTrang("home");
  }, 400);
}

// 11. Gắn các sự kiện click, submit và tìm kiếm cho những thành phần trên website.
$(function () {
  taiDuLieuTaiKhoan();

  $("#thanTrangDangNhap").html(htmlDangNhap("tabTrang"));
  $("#thanModalDangNhap").html(htmlDangNhap("tabModal"));

  capNhatHeader();
  toSangMenu();

  // Chuyển trang: mọi phần tử có data-page
  $(document).on("click", "[data-page]", function (e) {
    e.preventDefault();
    chuyenTrang($(this).data("page"), $(this).data("arg"));
  });

  // Header
  $("#bieuMauTimKiem").on("submit", function (e) {
    e.preventDefault();
    var tuKhoa = $("#oTimKiem").val().trim();
    if (tuKhoa) chuyenTrang("search", tuKhoa);
    else hienThongBao("Hãy nhập từ khóa tìm kiếm");
  });
  $(document).on("click", ".btn-logout", function (e) {
    e.preventDefault();
    dangXuat();
  });

  // Thẻ sản phẩm
  $(document).on("click", ".btn-add", function () {
    themVaoGioHang($(this).data("id"), 1);
  });
  $(document).on("click", ".btn-quick", function () {
    moXemNhanh($(this).data("id"));
  });
  $(document).on("click", ".btn-heart", function () {
    var id = $(this).data("id");
    if (!yeuCauDangNhap()) return;
    if (khiBamTim) khiBamTim(id);
    else batTatYeuThich(id);
  });

  // Modal xem nhanh
  $(document).on("click", ".btn-qv-add", function () {
    if (themVaoGioHang($(this).data("id"), Number($("#soLuongXemNhanh").val()) || 1))
      dongModal("modalXemNhanh");
  });
  $(document).on("click", ".btn-qv-detail", function () {
    var id = $(this).data("id");
    dongModal("modalXemNhanh");
    chuyenTrang("detail", id);
  });

  // Modal xóa + modal yêu thích
  $("#nutXacNhanXoa").on("click", function () {
    if (viecChoXoa) viecChoXoa();
    viecChoXoa = null;
    dongModal("modalXoa");
    hienThongBao("Đã xóa");
  });
  $("#nutXemYeuThich").on("click", function () {
    dongModal("modalYeuThich");
    chuyenTrang("wishlist");
  });

  // Đăng nhập / đăng ký
  $(document).on("submit", ".auth-form", function (e) {
    e.preventDefault();

    var bieuMau = this;
    var $bieuMau = $(this);

    // Kiểm tra email hoặc số điện thoại
     [
      { chon: ".auth-id", hopLe: taiKhoanHopLe, loi: "Tài khoản không hợp lệ" },
      { chon: ".auth-email", hopLe: emailHopLe, loi: QUY_TAC.email.loi },
      { chon: ".auth-phone", hopLe: sdtHopLe, loi: QUY_TAC.sdt.loi },
    ].forEach(function (muc) {
      var $o = $bieuMau.find(muc.chon);
      if (!$o.length) return;
      var giaTri = $o.val().trim();
      $o[0].setCustomValidity(giaTri && !muc.hopLe(giaTri) ? muc.loi : "");
    });

    // Kiểm tra mật khẩu xác nhận khi đăng ký
    var $oXacNhanMatKhau = $bieuMau.find(".pw2");

    if ($oXacNhanMatKhau.length) {
      $oXacNhanMatKhau[0].setCustomValidity(
        $oXacNhanMatKhau.val() === $bieuMau.find(".pw").val()
          ? ""
          : "Mật khẩu xác nhận không khớp",
      );
    }

    $bieuMau.addClass("was-validated");

    if (bieuMau.checkValidity()) {
      xuLyDangNhap($bieuMau);
    }
  });
  $(document).on("click", ".link-forgot", function (e) {
    e.preventDefault();
    hienThongBao("Đã gửi hướng dẫn đặt lại mật khẩu (demo)");
  });
});
