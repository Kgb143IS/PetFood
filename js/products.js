/* products.js - chỉ nạp ở san-pham.html
   URL hỗ trợ: ?type=dog | ?type=cat | ?q=từ khóa | ?brand=Tên (kết hợp với type) */

var trangThaiDanhSach = {
  mode: "dog",
  keyword: "",
  sub: "",
  brands: [],
  price: "",
  age: "",
  sort: "",
  shown: 6,
};
var menuCon = {
  dog: ["Thức ăn khô", "Thức ăn ướt", "Bánh thưởng"],
  cat: ["Thức ăn khô", "Pate", "Súp", "Catnip"],
};

// mode = 'dog' | 'cat' | 'search'
function hienDanhSach(cheDo, tuKhoa, thuongHieuChon) {
  tuKhoa = tuKhoa || "";
  trangThaiDanhSach = {
    mode: cheDo,
    keyword: tuKhoa,
    sub: "",
    brands: [],
    price: "",
    age: "",
    sort: "",
    shown: 6,
  };
  $("#locGia, #locTuoi, #locSapXep").val("");

  var tieuDe =
  cheDo === "dog"
    ? "Thức ăn cho chó"
    : cheDo === "cat"
      ? "Thức ăn cho mèo"
      : !tuKhoa && thuongHieuChon
        ? "Thương hiệu: " + thuongHieuChon
        : 'Kết quả tìm kiếm: "' + tuKhoa + '"';
  $("#tieuDeDanhSach").text(tieuDe);
  $("#duongDanDanhSach").text(tieuDe);
  if (cheDo === "search") $("#oTimKiem").val(tuKhoa);

  taoMenuCon();
  taoLocThuongHieu();

  if (thuongHieuChon) {
    // lọc sẵn theo thương hiệu
    trangThaiDanhSach.brands = [thuongHieuChon];
    $(".brand-check")
      .filter(function () {
        return $(this).val() === thuongHieuChon;
      })
      .prop("checked", true);
  }
  veDanhSach();
}

function taoMenuCon() {
  var dsMucCon = menuCon[trangThaiDanhSach.mode] || [];
  var html = "";
  if (dsMucCon.length > 0) {
    html =
      '<button class="btn btn-sm btn-success me-1 btn-sub" data-sub="">Tất cả</button>';
    for (var i = 0; i < dsMucCon.length; i++) {
      html +=
        '<button class="btn btn-sm btn-outline-success me-1 btn-sub" data-sub="' +
        dsMucCon[i] +
        '">' +
        dsMucCon[i] +
        "</button>";
    }
  }
  $("#khungDanhMucCon").html(html);
}

function taoLocThuongHieu() {
  var dsThuongHieu = [];
  for (var i = 0; i < sanPham.length; i++) {
    var p = sanPham[i];
    var loaiHopLe = trangThaiDanhSach.mode === "search" || p.type === trangThaiDanhSach.mode;
    if (loaiHopLe && dsThuongHieu.indexOf(p.brand) < 0) dsThuongHieu.push(p.brand);
  }
  var html = "";
  for (var j = 0; j < dsThuongHieu.length; j++) {
    html +=
      '<div class="form-check"><label class="form-check-label"><input type="checkbox" class="form-check-input brand-check" value="' +
      dsThuongHieu[j] +
      '"> ' +
      dsThuongHieu[j] +
      "</label></div>";
  }
  $("#khungThuongHieu").html(html);
}

function khopGia(gia, dieuKien) {
  if (dieuKien === "lt200") return gia < 200000;
  if (dieuKien === "200-400") return gia >= 200000 && gia <= 400000;
  if (dieuKien === "gt400") return gia > 400000;
  return true;
}

function layDanhSachDaLoc() {
  var s = trangThaiDanhSach;
  var ketQua = sanPham.filter(function (p) {
    if (s.mode !== "search" && p.type !== s.mode) return false;
    if (
      s.mode === "search" &&
      (p.name + " " + p.brand).toLowerCase().indexOf(s.keyword.toLowerCase()) <
        0
    )
      return false;
    if (s.sub && p.sub !== s.sub) return false;
    if (s.brands.length > 0 && s.brands.indexOf(p.brand) < 0) return false;
    if (s.age && p.age !== s.age) return false;
    return khopGia(p.price, s.price);
  });
  if (s.sort === "asc")
    ketQua.sort(function (a, b) {
      return a.price - b.price;
    });
  if (s.sort === "desc")
    ketQua.sort(function (a, b) {
      return b.price - a.price;
    });
  return ketQua;
}

function veDanhSach() {
  $("#luoiDanhSach").html(bieuTuongTai);
  setTimeout(function () {
    var danhSach = layDanhSachDaLoc();
    $("#soKetQua").text(danhSach.length + " sản phẩm");
    veLuoi("#luoiDanhSach", danhSach.slice(0, trangThaiDanhSach.shown), "col-6 col-lg-4");
    $("#nutXemThem").toggle(danhSach.length > trangThaiDanhSach.shown);
  }, 200);
}

function docBoLoc() {
  trangThaiDanhSach.brands = [];
  $(".brand-check:checked").each(function () {
    trangThaiDanhSach.brands.push($(this).val());
  });
  trangThaiDanhSach.price = $("#locGia").val();
  trangThaiDanhSach.age = $("#locTuoi").val();
  trangThaiDanhSach.sort = $("#locSapXep").val();
  trangThaiDanhSach.shown = 6;
  veDanhSach();
}

$(function () {
  sanPhamSanSang
    .done(khoiTao)
    .fail(function () {
      $("main").prepend(
        '<div class="container py-4"><div class="alert alert-danger">Không tải được dữ liệu sản phẩm.</div></div>'
      );
    });
});

function khoiTao() {
  // 1. Gắn sự kiện trước, để không bị bỏ sót ở bất kỳ nhánh nào
  $("#boLocDanhSach").on("change", "input, select", docBoLoc);
  $(document).on("click", ".btn-sub", function () {
    trangThaiDanhSach.sub = $(this).data("sub");
    trangThaiDanhSach.shown = 6;
    $(".btn-sub").removeClass("btn-success").addClass("btn-outline-success");
    $(this).removeClass("btn-outline-success").addClass("btn-success");
    veDanhSach();
  });
  $("#nutXemThem").on("click", function () {
    trangThaiDanhSach.shown += 6;
    veDanhSach();
  });

  // 2. Mở trang theo tham số URL
  var q = layThamSo("q");
  var thuongHieu = layThamSo("brand");
  var loai = layThamSo("type");

  if (q) {
    hienDanhSach("search", q);
  } else if (loai === "dog" || loai === "cat") {
    hienDanhSach(loai, "", thuongHieu);
  } else if (thuongHieu) {
    hienDanhSach("search", "", thuongHieu); // chỉ có ?brand=: tìm trên mọi sản phẩm, tick sẵn thương hiệu
  } else {
    hienDanhSach("dog");
  }
}
