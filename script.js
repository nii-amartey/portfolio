// ================================
// PORTFOLIO JAVASCRIPT
// ================================

// Show a message when the page loads
console.log("Chamberlain Nii Amartey's portfolio is running!");

// ================================
// NAVIGATION ACTIVE LINK
// ================================

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(function (link) {
    link.addEventListener("click", function () {

        navLinks.forEach(function (item) {
            item.classList.remove("active");
        });

        this.classList.add("active");
    });
});


// ================================
// SCROLL REVEAL ANIMATION
// ================================

const sections = document.querySelectorAll(".section");

const observer = new IntersectionObserver(
    function (entries) {

        entries.forEach(function (entry) {

            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }

        });

    },
    {
        threshold: 0.15
    }
);

sections.forEach(function (section) {
    observer.observe(section);
});


// ================================
// CURRENT YEAR IN FOOTER
// ================================

const year = new Date().getFullYear();

const footerText = document.querySelector("footer p");

if (footerText) {
    footerText.innerHTML =
        `© ${year} Chamberlain Nii Amartey. All Rights Reserved.`;
}