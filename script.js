document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.hash !== "") {
                e.preventDefault();
                const hash = link.hash;
                document.querySelector(hash).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer to highlight active nav link
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // 50% of the section must be visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Calendar Blog Logic ---
    const blogPosts = new Map();
    const blogPostElements = document.querySelectorAll('#blog-posts-data .blog-post');
    blogPostElements.forEach(post => {
        const date = post.getAttribute('data-date');
        if (date) {
            blogPosts.set(date, post.innerHTML);
        }
    });

    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearEl = document.getElementById('month-year');
    const blogDisplay = document.getElementById('blog-display-content');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const initialDisplayContent = blogDisplay.innerHTML;

    let currentDate = new Date();
    // Go to October 2023 to show the example posts
    currentDate.setFullYear(2023, 9); 

    function generateCalendar(date) {
        calendarGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();

        monthYearEl.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.textContent = day;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayCell.setAttribute('data-date', dateStr);

            if (blogPosts.has(dateStr)) {
                dayCell.classList.add('has-post');
                dayCell.addEventListener('mouseenter', () => {
                    blogDisplay.innerHTML = blogPosts.get(dateStr);
                    document.querySelectorAll('.calendar-day.active').forEach(d => d.classList.remove('active'));
                    dayCell.classList.add('active');
                });
                dayCell.addEventListener('mouseleave', () => {
                    // Optional: reset on mouse leave, or keep it displayed
                    // blogDisplay.innerHTML = initialDisplayContent;
                    // dayCell.classList.remove('active');
                });
            }

            calendarGrid.appendChild(dayCell);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
    });

    generateCalendar(currentDate);
});