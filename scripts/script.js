$(document).ready(function() { 
	$numOfItems = 15;
	$currentIndex = 4;
	$currentPage = 1;
	$("div").each(function() {
			if($(this).hasClass("item")) {
				if(this.id >= ($numOfItems)) {
					$(this).hide();	
				} 
			}
	});

	$(window).scroll(function() {
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
	});
	
	$(".form-control").on('input', function() {
		if($(this).val() == "") {
			$("div").each(function() {
			if($(this).hasClass("item")) {
				if(this.id >= ($numOfItems)) {
					$(this).hide();	
				} 
			}
			});
		}
	});
});
