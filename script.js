// ================= SMOOTH SCROLL =================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if(target){
            target.scrollIntoView({
                behavior: "smooth"
            });
        }

    });

});


// ================= NAVBAR SHADOW =================

window.addEventListener("scroll", () => {

    const navbar = document.querySelector(".navbar");

    if(window.scrollY > 50){
        navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,.08)";
    }
    else{
        navbar.style.boxShadow = "none";
    }

});


// ================= SCROLL ANIMATION =================

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }

    });

});

document.querySelectorAll(
".service-card, .portfolio-card, .testimonial-card, .pricing-card, .why-card, .process-step, .video-card, .client-card, .compare-card, .service-block, .premium-card"
).forEach((el)=>{

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
            fullName: form.fullName.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            message: form.message.value.trim()
        };

        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        try{

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if(!res.ok){
                throw new Error("Request failed");
            }

            alert("Thank you! We'll contact you soon.");
            form.reset();

        }catch(err){

            alert("Something went wrong. Please try again or email us directly.");

        }finally{

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

        }

    });

}


// ================= FAQ =================

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(question => {

    question.addEventListener("click", () => {

        const answer = question.nextElementSibling;
        const isOpen = answer.style.display === "block";

        answer.style.display = isOpen ? "none" : "block";
        question.classList.toggle("open", !isOpen);

    });

});


// ================= BACK TO TOP =================

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll",()=>{

    if(window.scrollY > 300){
        topBtn.style.display = "block";
    }
    else{
        topBtn.style.display = "none";
    }

});

topBtn.addEventListener("click",()=>{

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

});
// ================= MOBILE MENU =================

const menuToggle =
document.querySelector(".menu-toggle");

const navLinks =
document.querySelector(".nav-links");

if(menuToggle){

    menuToggle.addEventListener("click",()=>{

        navLinks.classList.toggle("active");

    });

}