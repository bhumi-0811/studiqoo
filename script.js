// ================= MOBILE MENU =================
// (Put first so menu works even if other stuff breaks)

const menuToggle = document.querySelector(".menu-toggle");
const navLinks   = document.querySelector(".nav-links");

if(menuToggle && navLinks){
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        // swap icon
        const icon = menuToggle.querySelector("i");
        if(icon){
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-xmark");
        }
    });

    // close menu when a nav link is clicked (mobile)
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            const icon = menuToggle.querySelector("i");
            if(icon){
                icon.classList.add("fa-bars");
                icon.classList.remove("fa-xmark");
            }
        });
    });
}


// ================= NAVBAR SCROLL SHADOW =================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    if(!navbar) return;
    if(window.scrollY > 50){
        navbar.style.boxShadow = "0 4px 24px rgba(14,14,16,.10)";
    } else {
        navbar.style.boxShadow = "none";
    }
});


// ================= SMOOTH SCROLL =================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e){
        const href = this.getAttribute("href");
        // ignore bare # links
        if(href === "#") return;
        const target = document.querySelector(href);
        if(target){
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});


// ================= SCROLL REVEAL =================

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll(
    ".service-card, .portfolio-card, .testimonial-card, " +
    ".pricing-card, .why-card, .process-step, .video-card, " +
    ".client-card, .compare-card, .service-block, .premium-card"
).forEach(el => {
    el.classList.add("hidden");
    observer.observe(el);
});


// ================= CONTACT FORM =================

const form = document.querySelector(".contact-form");

if(form){
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector("button[type='submit']");
        const originalText = submitBtn.textContent;

        const payload = {
            fullName: (form.fullName  || {value:""}).value.trim(),
            email:    (form.email     || {value:""}).value.trim(),
            phone:    (form.phone     || {value:""}).value.trim(),
            message:  (form.message   || {value:""}).value.trim()
        };

        submitBtn.textContent = "Sending…";
        submitBtn.disabled = true;

        try{
            const res = await fetch("/api/contact", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(payload)
            });
            if(!res.ok) throw new Error("Request failed");
            alert("Thank you! We'll be in touch soon.");
            form.reset();
        } catch(err){
            alert("Something went wrong. Please email us at teamstudiqoo@gmail.com");
        } finally{
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}


// ================= FAQ =================

document.querySelectorAll(".faq-question").forEach(question => {
    question.addEventListener("click", () => {
        const answer = question.nextElementSibling;
        const isOpen = answer.style.display === "block";
        answer.style.display = isOpen ? "none" : "block";
        question.classList.toggle("open", !isOpen);
    });
});


// ================= BACK TO TOP =================

const topBtn = document.getElementById("topBtn");

if(topBtn){
    window.addEventListener("scroll", () => {
        topBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });

    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}