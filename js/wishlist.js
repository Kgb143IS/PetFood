/* wishlist.js - chỉ nạp ở yeu-thich.html */

function veYeuThich() {
  if (yeuThich.length === 0) {
    $("#luoiYeuThich").html(
      '<div class="text-center py-5"><div class="display-1">💔</div><p>Chưa có sản phẩm yêu thích.</p><a class="btn btn-success" href="san-pham.html?type=dog">Khám phá sản phẩm</a></div>',
    );
    return;
  }
  var danhSach = yeuThich.map(function (id) {
    return timSanPham(id);
  });
  veLuoi("#luoiYeuThich", danhSach, "col-6 col-lg-3");
}

// Ở trang này, bấm tim = hỏi xác nhận xóa (thay vì toggle như trang khác)
khiBamTim = function (id) {
  xacNhanXoa(
    'Xóa "' + timSanPham(id).name + '" khỏi danh sách yêu thích?',
    function () {
      yeuThich = yeuThich.filter(function (x) {
        return x !== id;
      });
      luuTatCa();
      veYeuThich();
    },
  );
};

khiSanSang(function () {
  veYeuThich();
});
