/*
Revival Crusade Missions International
Church Website JavaScript - Based on TemplateMo Personal Shape
*/

// Mobile menu functionality
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close mobile menu when clicking on links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Enhanced Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Staggered animation for ministry items
const ministryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll('.ministry-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate');
                }, index * 150);
            });
        }
    });
}, { threshold: 0.1 });

// Observe all animation elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));

    const ministriesGrids = document.querySelectorAll('.ministries-grid');
    ministriesGrids.forEach(grid => {
        ministryObserver.observe(grid);
    });
});

// Enhanced smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Enhanced form submission with better UX
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Add loading state
        submitBtn.textContent = 'Sending Prayer...';
        submitBtn.disabled = true;
        submitBtn.style.background = 'linear-gradient(135deg, #94a3b8, #64748b)';
        
        // Simulate form submission with better feedback
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent! God Bless ✓';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            // Show success animation
            submitBtn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                submitBtn.style.transform = 'scale(1)';
            }, 200);
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                contactForm.reset();
            }, 3000);
        }, 2000);
    });
}

// Enhanced parallax effect for hero background
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.3;
        hero.style.transform = `translateY(${rate}px)`;
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Add subtle hover effects to ministry focus tags
document.querySelectorAll('.focus-tag').forEach(tag => {
    tag.addEventListener('mouseenter', () => {
        tag.style.transform = 'translateY(-2px) scale(1.05)';
    });
    
    tag.addEventListener('mouseleave', () => {
        tag.style.transform = 'translateY(0) scale(1)';
    });
});

// Add hover effects to feature tags
document.querySelectorAll('.feature-tag').forEach(tag => {
    tag.addEventListener('mouseenter', () => {
        tag.style.transform = 'translateY(-1px) scale(1.02)';
    });
    
    tag.addEventListener('mouseleave', () => {
        tag.style.transform = 'translateY(0) scale(1)';
    });
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Add a subtle typing effect to the hero subtitle (optional enhancement)
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect after page load (optional)
window.addEventListener('load', () => {
    const heroSubtitle = document.querySelector('.hero .subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        // Uncomment the line below if you want the typing effect
        // typeWriter(heroSubtitle, originalText, 30);
    }
});

// Add scroll-triggered counter animation for statistics (if you add them later)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Add prayer request functionality (if needed)
function submitPrayerRequest(formData) {
    // This would typically send data to your backend
    console.log('Prayer request submitted:', formData);
    
    // You can integrate with your church management system here
    // For now, we'll just show a success message
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: 'Your prayer request has been received. Our prayer team will lift you up in prayer.' });
        }, 2000);
    });
}

// Add Bible verse of the day functionality (optional)
const bibleVerses = [
    {
        verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
        reference: "Jeremiah 29:11"
    },
    {
        verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
        reference: "Romans 8:28"
    },
    {
        verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
        reference: "Proverbs 3:5-6"
    },
    {
        verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
        reference: "Joshua 1:9"
    },
    {
        verse: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
        reference: "Zephaniah 3:17"
    }
];

function displayVerseOfTheDay() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const verseIndex = dayOfYear % bibleVerses.length;
    const todaysVerse = bibleVerses[verseIndex];
    
    // You can use this to display a verse somewhere on your page
    console.log(`Today's Verse: "${todaysVerse.verse}" - ${todaysVerse.reference}`);
    
    return todaysVerse;
}

// Initialize verse of the day
document.addEventListener('DOMContentLoaded', () => {
    displayVerseOfTheDay();
});

// Add service times reminder (if you want to add this feature)
function checkServiceTimes() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    
    // Example service times - adjust according to your church schedule
    const serviceTimes = {
        0: [{ time: 9, name: 'Sunday Morning Service' }, { time: 18, name: 'Sunday Evening Service' }], // Sunday
        3: [{ time: 19, name: 'Wednesday Prayer Meeting' }], // Wednesday
        5: [{ time: 19, name: 'Friday Youth Service' }] // Friday
    };
    
    if (serviceTimes[day]) {
        serviceTimes[day].forEach(service => {
            if (hour === service.time - 1) { // 1 hour before service
                console.log(`Reminder: ${service.name} starts in 1 hour!`);
                // You could show a notification here
            }
        });
    }
}

// Check service times every hour
setInterval(checkServiceTimes, 3600000); // 1 hour = 3600000 milliseconds

// Add smooth reveal animation for elements as they come into view
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Apply reveal animation to all sections except pillars
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section:not(#pillars)');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        revealObserver.observe(section);
    });
    
    // Ensure pillars section is always visible
    const pillarsSection = document.querySelector('#pillars');
    if (pillarsSection) {
        pillarsSection.style.opacity = '1';
        pillarsSection.style.transform = 'none';
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Remove any loading overlay if you add one
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// Load upcoming events for home page (next 3 events)
async function loadUpcomingEvents() {
    try {
        const response = await fetch('http://localhost:5001/api/events/upcoming?limit=3');
        const events = await response.json();
        
        const homeEventsContainer = document.getElementById('homeEventsContainer');
        if (homeEventsContainer && events.length > 0) {
            homeEventsContainer.innerHTML = '';
            
            events.forEach(event => {
                const eventElement = createHomeEventElement(event);
                homeEventsContainer.appendChild(eventElement);
            });
        }
    } catch (error) {
        console.error('Error loading upcoming events:', error);
        // Keep the default static events if API fails
    }
}

function createHomeEventElement(event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item';
    
    const eventDate = new Date(event.date);
    const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
    const day = eventDate.getDate();
    
    eventDiv.innerHTML = `
        <div class="event-date">
            <span class="month">${month}</span>
            <span class="day">${day}</span>
        </div>
        <div class="event-details">
            <h4>${event.title}</h4>
            <p class="event-location">${event.location}</p>
            <p class="event-description">${event.description}</p>
        </div>
    `;
    
    return eventDiv;
}

// Load events when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadUpcomingEvents();
});

console.log('Revival Crusade Missions International - Website Loaded Successfully! 🙏');