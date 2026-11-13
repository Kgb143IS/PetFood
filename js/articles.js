/* articles.js - nạp ở bai-viet.html và bai-viet-chi-tiet.html (?id=1) */

var trangBaiViet = 1;

function veBaiViet() {
  var danhMuc = $("#locDanhMucBaiViet").val();
  var tuKhoa = ($("#timBaiViet").val() || "").toLowerCase();
  var danhSach = baiViet.filter(function (a) {
    return (
      (!danhMuc || a.cat === danhMuc) && a.title.toLowerCase().indexOf(tuKhoa) >= 0
    );
  });
  if (danhSach.length === 0) {
    $("#baiVietNoiBat").html(
      '<div class="text-center text-muted py-5">Không tìm thấy bài viết.</div>',
    );
    $("#luoiBaiViet, #phanTrangBaiViet").html("");
    return;
  }
  var f = danhSach[0];
  $(
    '<div class="col-md-4"><div class="card h-100" role="button" data-page="article" data-arg="' +
      f.id +
      '"><div class="display-1 d-flex align-items-center justify-content-center bg-light rounded-3 px-4" style="min-width:180px">' +
      f.icon +
      '</div><div><span class="badge bg-success">' +
      f.cat +
      "</span><h4>" +
      f.title +
      "</h4><p>" +
      f.desc +
      '</p><small class="text-muted">' +
      f.date +
      " · " +
      f.author +
      "</small></div></div>",
  );

  var phanConLai = danhSach.slice(1),
    soMoiTrang = 3;
  var tongSoTrang = Math.max(1, Math.ceil(phanConLai.length / soMoiTrang));
  var danhSachHienThi = phanConLai.slice(
    (trangBaiViet - 1) * soMoiTrang,
    trangBaiViet * soMoiTrang,
  );
  var html = "";
  for (var i = 0; i < danhSachHienThi.length; i++) {
    var a = danhSachHienThi[i];
    html +=
      '<div class="card card-body flex-md-row gap-3" role="button" data-page="article" data-arg="' +
      a.id +
      '"><div class="display-3 text-center bg-light rounded-top py-3">' +
      a.icon +
      '</div><div class="card-body"><span class="badge bg-success">' +
      a.cat +
      '</span><h6 class="mt-1">' +
      a.title +
      '</h6><p class="small">' +
      a.desc +
      '</p><small class="text-muted">' +
      a.date +
      "</small></div></div></div>";
  }
  $("#luoiBaiViet").html(html);
  var phanTrang = "";
  for (var n = 1; n <= tongSoTrang; n++)
    phanTrang +=
      '<li class="page-item' + (n === trangBaiViet ?" active" : "") +
      '"><a href="#" class="page-link article-page" data-n="' +
      n +
      '">' +
      n +
      "</a></li>";
  $("#phanTrangBaiViet").html(phanTrang);
}

function veChiTietBaiViet(id) {
  var a = null;
  for (var i = 0; i < baiViet.length; i++) {
    if (baiViet[i].id === id) a = baiViet[i];
  }
  if (!a) {
    chuyenTrang("articles");
    return;
  }
  document.title = "PetFood - " + a.title;
  $("#duongDanBaiViet").html(
    '<li class="breadcrumb-item"><a href="index.html">Trang chủ</a></li><li class="breadcrumb-item"><a href="bai-viet.html">Bài viết</a></li><li class="breadcrumb-item active">' +
      a.title +
      "</li>",
  );
  var noiDung = "";
  for (var j = 0; j < a.content.length; j++)
    noiDung += "<p>" + a.content[j] + "</p>";
  $("#khungBaiViet").html(
    "<h2>" +
      a.title +
      '</h2><p class="text-muted">' +
      a.author +
      " · " +
      a.date +
      '</p><div class="display-1 text-center bg-light rounded-3 py-3 mb-3">' +
      a.icon +
      "</div>" +
      noiDung,
  );
  var dsLienQuan = "";
  for (var k = 0; k < baiViet.length; k++) {
    if (baiViet[k].id !== id)
      dsLienQuan +=
        '<a href="#" class="list-group-item" data-page="article" data-arg="' +
        baiViet[k].id +
        '">' +
        baiViet[k].title +
        "</a>";
  }
  $("#baiVietLienQuan").html(dsLienQuan);
}

var baiViet = [];

$(function () {
  $.getJSON("../json/articles.json", function (duLieu) {
    baiViet = duLieu;
    if ($("#luoiBaiViet").length) veBaiViet();
    if ($("#khungBaiViet").length) veChiTietBaiViet(Number(layThamSo("id")));
  });

  $("#locDanhMucBaiViet").on("change", function () {
    trangBaiViet = 1;
    veBaiViet();
  });
  $("#timBaiViet").on("keyup", function () {
    trangBaiViet = 1;
    veBaiViet();
  });
  $(document).on("click", ".article-page", function (e) {
    e.preventDefault();
    trangBaiViet = $(this).data("n");
    veBaiViet();
  });
});
