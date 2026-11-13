/* support.js - chỉ nạp ở ho-tro.html */

$(function () {
  $("#timCauHoi").on("keyup", function () {
    var tuKhoa = $(this).val().toLowerCase();
    $("#dsCauHoi .accordion-item").each(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(tuKhoa) >= 0);
    });
  });

  $("#bieuMauHoTro").on("submit", function (e) {
    e.preventDefault();
    $(this).addClass("was-validated");
    if (this.checkValidity()) {
      hienThongBao("Đã gửi yêu cầu, chúng tôi sẽ phản hồi sớm!");
      this.reset();
      $(this).removeClass("was-validated");
    }
  });
});
