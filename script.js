document.addEventListener('DOMContentLoaded', function() {

    const gallery = document.getElementById('gallery');
    const categorySelect = document.getElementById('category');
    const searchInput = document.getElementById('search');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const sortRatingBtn = document.getElementById('sort-rating');
    const sortDirection = document.getElementById('sort-direction');
    const totalCountSpan = document.getElementById('total-count');
    const avgRatingSpan = document.getElementById('avg-rating');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');

    let images = [];
    let filteredImages = [];
    let sortAscending = false;

    loadImages();

    applyFiltersBtn.addEventListener('click', applyFilters);
    sortRatingBtn.addEventListener('click', toggleSort);
    searchInput.addEventListener('input', function() {

        applyFilters();
    });
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    function loadImages() {
        fetch('images.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить данные');
                }
                return response.json();
            })
            .then(data => {
                images = data;
                filteredImages = [...images];

                populateCategories();

                renderGallery();
                updateStats();
            })
            .catch(error => {
                console.error('Ошибка загрузки данных:', error);
                showError('Не удалось загрузить изображения. Пожалуйста, попробуйте позже.');
            });
    }

    function populateCategories() {
        const categories = new Set(images.map(img => img.category));
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    function applyFilters() {
        const categoryFilter = categorySelect.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        filteredImages = images.filter(image => {
            const matchesCategory = !categoryFilter || image.category === categoryFilter;
            const matchesSearch = !searchTerm || 
                image.title.toLowerCase().includes(searchTerm);
            
            return matchesCategory && matchesSearch;
        });

        if (sortAscending !== null) {
            sortImages();
        }
        
        renderGallery();
        updateStats();
    }

    function toggleSort() {
        sortAscending = !sortAscending;
        sortDirection.textContent = sortAscending ? '↑' : '↓';
        sortImages();
        renderGallery();
    }

    function sortImages() {
        filteredImages.sort((a, b) => {
            return sortAscending ? a.rating - b.rating : b.rating - a.rating;
        });
    }

    function renderGallery() {
        gallery.innerHTML = '';
        
        if (filteredImages.length === 0) {
            gallery.innerHTML = '<p class="error-message">Изображения не найдены</p>';
            return;
        }
        
        filteredImages.forEach(image => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <img src="${image.url}" alt="${image.title}">
                <div class="image-info">
                    <div class="image-title">${image.title}</div>
                    <div class="image-rating">${formatRating(image.rating)}</div>
                </div>
            `;
            
            card.addEventListener('click', function() {
                showImageDetails(image);
            });
            
            gallery.appendChild(card);
        });
    }

    function showImageDetails(image) {
        document.getElementById('modal-title').textContent = image.title;
        document.getElementById('modal-image').src = image.url;
        document.getElementById('modal-image').alt = image.title;
        document.getElementById('modal-rating').textContent = formatRating(image.rating);
        document.getElementById('modal-category').textContent = image.category;        
        modal.style.display = 'block';
    }

    function updateStats() {
        totalCountSpan.textContent = filteredImages.length;
        
        if (filteredImages.length > 0) {
            const avgRating = filteredImages.reduce((sum, image) => sum + image.rating, 0) / filteredImages.length;
            avgRatingSpan.textContent = avgRating.toFixed(1);
        } else {
            avgRatingSpan.textContent = '0';
        }
    }

    function formatRating(rating) {
        return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '') + ` ${rating}`;
    }

    function showError(message) {
        gallery.innerHTML = `<p class="error-message">${message}</p>`;
    }
});
