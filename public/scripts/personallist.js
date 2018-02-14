var refineButtons = document.querySelectorAll(".refineButton");

console.log(refineButtons);

refineButtons.forEach(function(button) {
	button.addEventListener("click", function(e) {
		refineButtons.forEach(function (button) {
			button.classList.remove("selected");
		});
		button.classList.add("selected");
		console.log(button.getAttribute("data-name"));
	});
});
