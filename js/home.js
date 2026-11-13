/* home.js - chỉ nạp ở index.html */

var thuongHieuTrangChu = [];
var thuongHieuSanSang = taiJSON("brands.json").done(function (duLieu) {
  thuongHieuTrangChu = duLieu;
});

function veTrangChu() {
  var banChay = sanPham
    .filter(function (p) {
      return p.hot;
    })
    .slice(0, 4);
  var moi = sanPham
    .filter(function (p) {
      return p.isNew;
    })
    .slice(0, 4);
  veLuoi("#trangChuBanChay", banChay, "col-6 col-lg-3");
  veLuoi("#trangChuMoi", moi, "col-6 col-lg-3");
  veThuongHieu();
}

function veThuongHieu() {
  var html = "";
  thuongHieuTrangChu.forEach(function (b) {
    html +=
      '<div class="col-6 col-md-4 col-lg-2">' +
      '<a href="san-pham.html?brand=' +
      encodeURIComponent(b.name) +
      '" ' +
      'class="card h-100 text-decoration-none text-body text-center p-3 shadow-sm">' +
      '<div class="d-flex align-items-center justify-content-center mb-2" style="height:70px">' +
      '<img src="' +
      b.logo +
      '" alt="' +
      b.name +
      '" ' +
      'style="max-width:100%; max-height:100%; object-fit:contain" ' +
      "onerror=\"this.style.display='none'\">" +
      "</div>" +
      '<span class="fw-semibold small">' +
      b.name +
      "</span>" +
      "</a>" +
      "</div>";
  });
  $("#thuongHieuNoiBat").html(html);
}

khiSanSang(function () {
  // Chờ brands.json tải xong rồi mới vẽ trang
  thuongHieuSanSang.done(veTrangChu).fail(function () {
    console.error("Không đọc được brands.json");
    thuongHieuTrangChu = [];
    veTrangChu(); // vẫn hiển thị sản phẩm dù thiếu thương hiệu
  });
});
