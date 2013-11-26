$(document).ready(function() { 
	$numOfItems = 15;
	$currentIndex = 4;
	$currentPage = 1;
	$itemsDiv = $(".items");
	$searchResults= $(".searchResults");
	$searchMade = false;
	$tempText = "no search";
	$("div").each(function() {
			if($(this).hasClass("item")) {
				if(this.id >= ($numOfItems)) {
					$(this).hide();	
				} 
			}
	});

	$(window).scroll(function() {
		var input = $(".form-control").val();
		if(input == "") {
			$scrollTop = $(this).scrollTop();
			$windowHeight = $(window).height();
			if($scrollTop + $windowHeight == $(document).height()) {
				$currentPage++;
				$currentIndex += $numOfItems;
				$("div").each(function(i) {
					if($(this).hasClass("item")) {
						if((this.id >= ($currentPage * $numOfItems)) && (this.id < (($currentPage+1)* $numOfItems)))  {
							$(this).fadeIn("slow", function() {});	
						}
					}
				});
			}
		}
	});
	
	$(".form-control").on('input', resetSearch);
	$(".form-control").on('keypress', function(e) {
		var p = e.which;
		if (p == 13)
			search();
	});
	$(".glyphicon-search").click(function() {
			search();
	});

	function search() {
		var input = $(".form-control").val();
		if ((input != "")  && (input != $tempText)) {
			removeResults();
			$itemsDiv.hide();
			$searchResults.show();
			$tempText = input;
			$searchMade = true;
			var count = 0; 
			var tempCount = 0;
			$("div").each(function() {
				if($(this).hasClass("item")) {
					$currentTitle = $(this).find("h3");
					var currentTitleText = $currentTitle.contents().text();
					currentTitleText = currentTitleText.toLowerCase();
					input = input.toLowerCase();
					if(currentTitleText.indexOf(input) != -1) {
						$row = $("div.row." + tempCount);
						if ((count % 3 == 0) && count != 0 ) {
							$searchResults.append("</div>");
							$searchResults.append("<div class=\"row " + count + "\">" );
							tempCount = count;
							$row = $("div.row." + tempCount);
							$row.addClass("searchRow");
						}
						if (count == 0) {
							$searchResults.append("<div class=\"row " + count + "\">" );
							tempCount = count;
							$row = $("div.row." + tempCount);
							$row.addClass("searchRow");
						}
						$(this).addClass("searchItem");
						$(this).show();
						$row.append($(this).clone());
						count++;
						
					} else {
						$(this).hide();
					}
				}
			});
			if (count % 3 != 0) {
				$searchResults.append("</div>");
			}
		}
	}

	function resetSearch() {
		if($(this).val() == "") {
			$searchMade = false;
			$("div").each(function() {
				if($(this).hasClass("searchRow")) {
					$(this).remove();
				} else if($(this).hasClass("item")) {
					if(this.id >= ($numOfItems)) {
						$(this).hide();	
					} else {
						$(this).show();
					}
				}
			});
			$itemsDiv.show();
			$searchResults.hide();
			$tempText = "no search";
		}
	}
	function removeResults() {
		$("div").each(function () {
			if($(this).hasClass("searchRow")) {
				$(this).remove();
			}
		});
	}
});
