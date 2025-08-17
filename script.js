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
    
    const blogPostForm = document.getElementById('blog-post-form');
    const placeholderText = document.querySelector('.placeholder-text');

    let currentDate = new Date(); 
    let selectedDateStr = null;

    function displayContentForDate(dateStr) {
        // Hide form first
        blogPostForm.style.display = 'none';
        
        // Hide placeholder text
        if (placeholderText) {
            placeholderText.style.display = 'none';
        }
        
        if (blogPosts.has(dateStr) && !isEditMode) {
            // Show existing post in view mode
            // Create a temporary div to show content without affecting the form
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = blogPosts.get(dateStr);
            
            // Clear only non-form content
            const existingContent = blogDisplay.querySelector('.temp-content');
            if (existingContent) {
                existingContent.remove();
            }
            
            contentDiv.className = 'temp-content';
            blogDisplay.insertBefore(contentDiv, blogPostForm);
            
        } else if (isEditMode) {
            // Show form to add/edit a post (in edit mode)
            const date = new Date(dateStr + 'T00:00:00');
            document.getElementById('form-date').textContent = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
            
            // Clear any existing content display
            const existingContent = blogDisplay.querySelector('.temp-content');
            if (existingContent) {
                existingContent.remove();
            }
            
            // If post exists, pre-fill the form for editing
            if (blogPosts.has(dateStr)) {
                const existingContent = blogPosts.get(dateStr);
                // Extract title and content from existing HTML (simple parsing)
                const titleMatch = existingContent.match(/<h3>(.*?)<\/h3>/);
                const contentMatch = existingContent.match(/<p>(.*?)<\/p>/);
                
                document.getElementById('post-title').value = titleMatch ? titleMatch[1] : '';
                document.getElementById('post-content').value = contentMatch ? contentMatch[1] : '';
            } else {
                document.getElementById('post-title').value = '';
                document.getElementById('post-content').value = '';
            }
            
            blogPostForm.style.display = 'flex';
        } else {
            // Show placeholder for non-edit mode
            const existingContent = blogDisplay.querySelector('.temp-content');
            if (existingContent) {
                existingContent.remove();
            }
            if (placeholderText) {
                placeholderText.style.display = 'block';
            }
        }
    }

    function handleDayClick(dayCell) {
        if (dayCell.classList.contains('empty')) return;

        document.querySelectorAll('.calendar-day.active').forEach(d => d.classList.remove('active'));
        dayCell.classList.add('active');

        selectedDateStr = dayCell.getAttribute('data-date');
        displayContentForDate(selectedDateStr);
    }

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
            }

            dayCell.addEventListener('click', () => handleDayClick(dayCell));

            calendarGrid.appendChild(dayCell);
        }
    }

        // Edit mode toggle (hidden by default)
    const editModeToggle = document.createElement('button');
    editModeToggle.textContent = '进入编辑模式';
    editModeToggle.style.position = 'fixed';
    editModeToggle.style.bottom = '20px';
    editModeToggle.style.right = '20px';
    editModeToggle.style.zIndex = '1000';
    editModeToggle.style.padding = '10px';
    editModeToggle.style.backgroundColor = '#4CAF50';
    editModeToggle.style.color = 'white';
    editModeToggle.style.border = 'none';
    editModeToggle.style.borderRadius = '5px';
    editModeToggle.style.cursor = 'pointer';
    document.body.appendChild(editModeToggle);

    let isEditMode = false;
    editModeToggle.addEventListener('click', () => {
        if (!isEditMode) {
            const password = prompt('输入密码以启用编辑模式:');
            if (password === 'wubidong') {
                isEditMode = true;
                editModeToggle.textContent = '退出编辑模式';
                alert('编辑模式已启用');
            } else {
                alert('密码错误!');
            }
        } else {
            isEditMode = false;
            editModeToggle.textContent = '进入编辑模式';
            blogPostForm.style.display = 'none';
            
            // Clear any temporary content
            const existingContent = blogDisplay.querySelector('.temp-content');
            if (existingContent) {
                existingContent.remove();
            }
            
            // Show placeholder
            if (placeholderText) {
                placeholderText.style.display = 'block';
            }
            
            selectedDateStr = null;
            // Remove active state from calendar days
            document.querySelectorAll('.calendar-day.active').forEach(d => d.classList.remove('active'));
        }
    });

    blogPostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedDateStr || !isEditMode) return;

        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const date = new Date(selectedDateStr + 'T00:00:00');
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newPostHTML = `
            <div class="blog-date">${formattedDate}</div>
            <h3>${title}</h3>
            <p>${content}</p>
        `;

        blogPosts.set(selectedDateStr, newPostHTML);
        
        // Save to JSON file
        const postsObject = Object.fromEntries(blogPosts);
        fetch('save_posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postsObject)
        })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            displayContentForDate(selectedDateStr);
            // Refresh calendar to show new post indicator
            generateCalendar(currentDate);
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('保存失败，请重试');
        });

        // Update calendar view
        const dayCell = document.querySelector(`.calendar-day[data-date="${selectedDateStr}"]`);
        if (dayCell) {
            dayCell.classList.add('has-post');
        }
    });

    // Load saved posts from JSON file
    function loadPosts() {
        fetch('blog_posts.json')
            .then(response => response.json())
            .then(data => {
                if (data) {
                    blogPosts.clear();
                    Object.entries(data).forEach(([date, content]) => {
                        blogPosts.set(date, content);
                    });
                    generateCalendar(currentDate);
                }
            })
            .catch(() => {
                console.log('No blog_posts.json file found, starting with empty posts.');
            });
    }
    
    loadPosts();

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