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

var checkParams = function() {
	var details_num = $('#details_num').val();
	var price = $('#price').val();
	var extra_price = $('#extra_price').val();
	var addition_order = $('#addition_order').val();
	var failure = $('#failure').val();

	if (details_num.length != 0 && price.length != 0 
		&& extra_price.length != 0 && addition_order.length != 0
		&& failure.length != 0) {
		$('#calculate').removeAttr('disabled');
} 
else {
	$('#calculate').attr('disabled', 'disabled');
}
}

var factorial = function(n) {
	return n ? n * factorial(n - 1) : 1;
}

var probability = function(p, j, x) {
	var step1 = factorial(x)/(factorial(j)*factorial(x-j));
	var step2 = step1 * Math.pow(p, j);
	var step3 = step2 * Math.pow((1-p), (x-j));
	return step3;
}

var expression = function(n, K, c, v, p, x) {
	var step1 = 0;
	for (let i = 0; i <= x; ++i) {
		step1 += i*probability(p, i, x);
	}
	var step2 = 0;
	for (let i = 0; i <= x-n; ++i) {
		step2 += (x-n-i)*probability(p, i, x);
	}
	var step3 = 0;
	for (let i = x-n+1; i <= x; ++i) {
		step3 += probability(p, i, x);
	}
	var step4 = 0;
	for (let i = x-n+1; i <= x-1; ++i) {
		step4 += calculateCost(n-x+i, K, c, v, p)[0]*probability(p, i, x);
	}
	var step5 = Math.pow((1 - probability(p, x, x)), -1);
	var step6 = c * (x - step1) - v * step2 + K * step3 + step4;
	return step5 * step6;
}

var cash = new Map();

var calculateCost = function(n, K, c, v, p) {
	if (cash.has(n)) return cash.get(n);
	else {
		let minF = 999999999;
		let x = 0;
		for (let i = n; i < 1000000000; ++i) {
			let tmp = expression(n, K, c, v, p, i);
			if (tmp < minF) {
				minF = tmp;
				x = i;
			} else if (tmp > minF) {
				break;
			}
		}
		cash.set(n, [minF, x]);
		return [minF, x];
	}
}

var main = function() {
	$(".float").inputFilter(function(value) {
		return /^\d*[.,]?\d*$/.test(value); 
	});
	$(".int").inputFilter(function(value) {
		return /^\d*$/.test(value); 
	});

	$("#upload_data").change(function(event) {
		var file = this.files[0];
		var reader = new FileReader();
		reader.onload = function (e) {
			var data = (e.target.result).split(":");
			console.log(data);
			if (data.length == 5) {
				$("#details_num").val(data[0]);
				$("#label_details_num").addClass("active");
				$("#details_num").addClass("valid");
				$("#price").val(data[1]);
				$("#label_price").addClass("active");
				$("#price").addClass("valid");
				$("#extra_price").val(data[2]);
				$("#label_extra_price").addClass("active");
				$("#extra_price").addClass("valid");
				$("#addition_order").val(data[3]);
				$("#label_addition_order").addClass("active");
				$("#addition_order").addClass("valid");
				$("#failure").val(data[4]);
				$("#label_failure").addClass("active");
				$("#failure").addClass("valid");
				$('#calculate').removeAttr('disabled');
			}
			else {
				alert("Некорректное содержимое файла.");
			}
		};
		reader.readAsText(file);
	});

	$("#save_data").click(function() {
		var data = "";
		data += validateValue("details_num", false);
		data += ":";
		data += validateValue("price", false);
		data += ":";
		data += validateValue("extra_price", false);
		data += ":";
		data += validateValue("addition_order", false);
		data += ":";
		data += validateValue("failure", false);
		var txtData = 'data:application/txt;charset=utf-8,' + encodeURIComponent(data);
		this.href = txtData;
		this.target = '_blank';
		this.download = 'data.orz';
	});

	var reportText = "";

	$("#calculate").click(function() {
		$("#result tbody tr").remove();
		reportText = "";
		var details_num = validateValue("details_num", true);
		var price = validateValue("price", true);
		var extra_price = validateValue("extra_price", true);
		var addition_order = validateValue("addition_order", true);
		var failure = validateValue("failure", true);


		$("#result").css("display", "table");

		for (let i = 1; i <= details_num; ++i) {
			var res = calculateCost(i, addition_order, price, extra_price, failure);
			$('#result tbody').append('<tr><td>' + i + '</td><td>' + res[1] + '</td><td>' + res[0].toFixed(3) + '</td></tr>');
			reportText += "Для обеспечения " + i + " исправных деталей размер заказываемой партии должен составить " + res[1] + ". При этом затраты: " + res[0].toFixed(3) + ".\r\n";
		}
		cash = new Map();

		$("#save_report").css("display", "block");
	});

	$("#save_report").click(function() {
		if (reportText == "")
		{
			alert("Невозможно сформировать отчет. Отсутствует информация.");
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

