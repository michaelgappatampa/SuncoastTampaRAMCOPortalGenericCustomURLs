document.addEventListener("DOMContentLoaded", function () {
  const nav = document.getElementById("navigation");

  // Toggle class when clicking on the ::before pseudo "Menu" button
  nav.addEventListener("click", function (e) {
    // Only toggle if they clicked the pseudo element area
    const clickedWithinPseudo = e.offsetY < 50; // adjust if needed
    const screenIsMobile = window.innerWidth <= 958;

    if (clickedWithinPseudo && screenIsMobile) {
      nav.classList.toggle("menu-open");
    }
  });

  // Optional: close menu if clicking outside
  document.addEventListener("click", function (e) {
    const nav = document.getElementById("navigation");
    const isClickInside = nav.contains(e.target);
    const screenIsMobile = window.innerWidth <= 958;

    if (!isClickInside && screenIsMobile) {
      nav.classList.remove("menu-open");
    }
  });
});
