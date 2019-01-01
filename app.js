(function($) {
	$.fn.inputFilter = function(inputFilter) {
		return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
			if (inputFilter(this.value)) {
				this.oldValue = this.value;
				this.oldSelectionStart = this.selectionStart;
				this.oldSelectionEnd = this.selectionEnd;
			} else if (this.hasOwnProperty("oldValue")) {
				this.value = this.oldValue;
				this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
			}
		});
	};
}(jQuery));

var validateValue = function(element, flag) {
	var value = $("#" + element).val();
	if (value == "" || value == null || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
		if (flag) {
			$("#" + element).val(0);
			$("#label_"+element).addClass("active");
			$("#" + element).addClass("valid");
		}
		return 0.0;
	}
	return parseFloat(value);
}

var main = function() {
	$(".float").inputFilter(function(value) {
		return /^-?\d*[.,]?\d*$/.test(value); 
	});

	$("#upload_data").change(function(event) {
		var file = this.files[0];
		var reader = new FileReader();
		reader.onload = function (e) {
			var data = (e.target.result).split("\r\n");
			if (data.length == 6) {
				$("#year_need").val(data[0]);
				$("#label_year_need").addClass("active");
				$("#year_need").addClass("valid");
				$("#storage").val(data[1]);
				$("#label_storage").addClass("active");
				$("#storage").addClass("valid");
				$("#order").val(data[2]);
				$("#label_order").addClass("active");
				$("#order").addClass("valid");
				$("#price").val(data[3]);
				$("#label_price").addClass("active");
				$("#price").addClass("valid");
				$("#deficit").val(data[4]);
				$("#label_deficit").addClass("active");
				$("#deficit").addClass("valid");
				$("#volume").val(data[5]);
				$("#label_volume").addClass("active");
				$("#volume").addClass("valid");
			}
			else {
				alert("Некорректное содержимое файла.");
			}
		};
		reader.readAsText(file);
	});

	$("#save_data").click(function() {
		var data = "";
		data += validateValue("year_need", false);
		data + "\r\n";
		data += validateValue("storage", false);
		data + "\r\n";
		data += validateValue("order", false);
		data + "\r\n";
		data += validateValue("price", false);
		data + "\r\n";
		data += validateValue("deficit", false);
		data + "\r\n";
		data += validateValue("volume", false);
		var txtData = 'data:application/txt;charset=utf-8,' + encodeURIComponent(data);
		this.href = txtData;
		this.target = '_blank';
		this.download = 'data.orz';
	});

	var reportText = "";

	$("#calculate").click(function() {
		reportText = "";
		var yearNeed = validateValue("year_need", true);
		var storage = validateValue("storage", true);
		var order = validateValue("order", true);
		var price = validateValue("price", true);
		var deficit = validateValue("deficit", true);
		var volume = validateValue("volume", true);

		var eoqFlag = true, 
		eoqWithSelfFlag = true, 
		eoqWithDeficitFlag = true; 
// 		eoqWithDeficitAndSelfFlag = true;
		var eoq = Math.sqrt(2*yearNeed*order/(storage*price/100));
		if (isNaN(eoq)) eoqFlag = false;
		else {
			reportText += "Оптимальный размер заказа: \r\n";
			reportText += "sqrt(2*" + yearNeed + "*" + order + "/(" + price + "*" + (storage/100) + ")) = " + eoq + "\r\n\r\n";
		}
		var eoqWithSelf = Math.sqrt(2*yearNeed*order/(storage*price/100*(1-yearNeed/volume)));
		if (isNaN(eoqWithSelf)) eoqWithSelfFlag = false;
		else {
			reportText += "Оптимальный размер заказа при собственном производстве: \r\n";
			reportText += "sqrt(2*" + yearNeed + "*" + order + "/(" + price + "*" + (storage/100) + "*(1-" + yearNeed + "/" + volume + "))) = " + eoqWithSelf + "\r\n\r\n";
		}
		var eoqWithDeficit = eoq*Math.sqrt((price*storage/100+deficit)/deficit);
		if (isNaN(eoqWithDeficit)) eoqWithDeficitFlag = false;
		else {
			reportText += "Оптимальный размер заказа в условиях дефицита: \r\n";
			reportText += eoq + "*" + "sqrt((" + price + "*" + (storage/100) + "+" + deficit + ")/" + deficit + ") = " + eoqWithDeficit + "\r\n\r\n";
		}
// 		var eoqWithDeficitAndSelf = eoqWithSelf*Math.sqrt((price*storage/100+deficit)/deficit);
// 		if (isNaN(eoqWithDeficitAndSelf)) eoqWithDeficitAndSelfFlag = false;
// 		else {
// 			reportText += "Оптимальный размер заказа в условиях дефицита при собственном производстве: \r\n";
// 			reportText += eoq + "*" + "sqrt((" + price + "*" + (storage/100) + "+" + deficit + ")/" + deficit + ") = " + eoqWithDeficitAndSelf + "\r\n\r\n";
// 		}

		if (!eoqFlag || !eoqWithSelfFlag || !eoqWithDeficitFlag) { // || !eoqWithDeficitAndSelfFlag) {
			var alertText = "Некорректные данные. Невозможно посчитать:\n"
			if (!eoqFlag) alertText += "    Оптимальный размер заказа\n";
			if (!eoqWithSelfFlag) alertText += "    Оптимальный размер заказа при собственном производстве\n";
			if (!eoqWithDeficitFlag) alertText += "    Оптимальный размер заказа в условиях дефицита\n";
// 			if (!eoqWithDeficitAndSelfFlag) alertText += "    Оптимальный размер заказа в условиях дефицита при собственном производстве";
			alert(alertText);
			eoqFlag = true;
			eoqWithSelfFlag = true;
			eoqWithDeficitFlag = true;
// 			eoqWithDeficitAndSelfFlag = true;
		}

		$("#eoq").text(Math.round(eoq));
		$("#eoq_self").text(Math.round(eoqWithSelf));
		$("#eoq_deficit").text(Math.round(eoqWithDeficit));
// 		$("#eoq_self_deficit").text(Math.round(eoqWithDeficitAndSelf));

		$("#save_report").css("display", "block");
	});

	$("#save_report").click(function() {
		if (reportText == "")
		{
			alert("Сформировать отчет не из чего.");
		}
		else {
			var txtData = 'data:application/txt;charset=utf-8,' + encodeURIComponent(reportText);
			this.href = txtData;
			this.target = '_blank';
			this.download = 'report.txt';
		}
	});
}

$(document).ready(main);

