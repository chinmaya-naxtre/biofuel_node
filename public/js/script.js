function submitState() {
  $("#check-price-btn").text("Checking...");
  $("#check-price-btn").attr("disabled", "true");
  $.ajax({
    method: "POST",
    url: "fuel_price_by_state",
    data: { selectpicker: $("#state").val() },
  }).then((result) => {
    console.log(result);
    let stateWithPrice = result.stateWithPrice;
    let cityWithPrice = result.cityWithPrice;
    let statehtml = "";
    let cityhtml = "";
    if (stateWithPrice.length > 0) {
      for (let i = 0; i < stateWithPrice.length; i++) {
        statehtml =
          statehtml +
          `<tr><td>` +
          stateWithPrice[i].state +
          `</td> <td>` +
          stateWithPrice[i].price +
          `</td></tr>`;
      }
      $("#fuel-price-state").html(statehtml);
    } else {
      $("#state-fuel-container").css("display", "none");
    }
    if (cityWithPrice.length > 0) {
      for (let i = 0; i < cityWithPrice.length; i++) {
        cityhtml =
          cityhtml +
          "<tr><td>" +
          cityWithPrice[i].city +
          "</td><td>" +
          cityWithPrice[i].price +
          "</td></tr>";
      }

      $("#fuel-price-city").html(cityhtml);
    } else {
      $("#city-fuel-container").css("display", "none");
    }
    $("#check-price-btn").text("Check Price");
    $("#check-price-btn").removeAttr("disabled");
    $("#fuel-container").css("display", "block");
  });
}
