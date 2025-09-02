/*
Events Page JavaScript - Revival Crusade Missions International
*/

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global variables
let currentPage = 1;
let currentFilters = {
    category: '',
    search: '',
    timeFilter: 'upcoming'
};
let isLoading = false;

// DOM Elements
const featuredEventsGrid = document.getElementById('featuredEventsGrid');
const eventsGrid = document.getElementById('eventsGrid');
const pagination = document.getElementById('pagination');
const eventModal = document.getElementById('eventModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

// Filter elements
const categoryFilter = document.getElementById('categoryFilter');
const timeFilter = document.getElementById('timeFilter');
const searchFilter = document.getElementById('searchFilter');
const clearFiltersBtn = document.getElementById('clearFilters');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadFeaturedEvents();
    loadEvents();
});

// Initialize event listeners
function initializeEventListeners() {
    // Filter event listeners
    categoryFilter.addEventListener('change', handleFilterChange);
    timeFilter.addEventListener('change', handleFilterChange);
    searchFilter.addEventListener('input', debounce(handleFilterChange, 500));
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Modal event listeners
    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && eventModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle filter changes
function handleFilterChange() {
    currentFilters.category = categoryFilter.value;
    currentFilters.search = searchFilter.value;
    currentFilters.timeFilter = timeFilter.value;
    currentPage = 1;
    loadEvents();
}

// Clear all filters
function clearFilters() {
    categoryFilter.value = '';
    timeFilter.value = 'upcoming';
    searchFilter.value = '';
    currentFilters = {
        category: '',
        search: '',
        timeFilter: 'upcoming'
    };
    currentPage = 1;
    loadEvents();
}

// Load featured events
async function loadFeaturedEvents() {
    try {
        showLoading(featuredEventsGrid);
        
        const response = await fetch(`${API_BASE_URL}/events/featured`);
        const data = await response.json();
        
        if (data.success) {
            displayFeaturedEvents(data.data);
        } else {
            showError(featuredEventsGrid, 'Failed to load featured events');
        }
    } catch (error) {
        console.error('Error loading featured events:', error);
        showError(featuredEventsGrid, 'Failed to load featured events');
    }
}

// Load events with filters and pagination
async function loadEvents() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading(eventsGrid);
        
        // Build query parameters
        const params = new URLSearchParams({
            page: currentPage,
            limit: 9
        });
        
        if (currentFilters.category) params.append('category', currentFilters.category);
        if (currentFilters.search) params.append('search', currentFilters.search);
        
        // Handle time filter
        const now = new Date();
        switch (currentFilters.timeFilter) {
            case 'this-month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                params.append('startDate', startOfMonth.toISOString());
                params.append('endDate', endOfMonth.toISOString());
                break;
            case 'next-month':
                const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                params.append('startDate', nextMonthStart.toISOString());
                params.append('endDate', nextMonthEnd.toISOString());
                break;
            case 'all':
                params.append('status', '');
                break;
            default: // upcoming
                params.append('status', 'upcoming');
        }
        
        const response = await fetch(`${API_BASE_URL}/events?${params}`);
        const data = await response.json();
        
        if (data.success) {
            displayEvents(data.data);
            displayPagination(data.pagination);
        } else {
            showError(eventsGrid, 'Failed to load events');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showError(eventsGrid, 'Failed to load events');
    } finally {
        isLoading = false;
    }
}

// Display featured events
function displayFeaturedEvents(events) {
    if (!events || events.length === 0) {
        featuredEventsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⭐</div>
                <h3>No Featured Events</h3>
                <p>Check back soon for featured events!</p>
            </div>
        `;
        return;
    }
    
    featuredEventsGrid.innerHTML = events.map(event => createEventCard(event, true)).join('');
    
    // Add click listeners to featured event cards
    featuredEventsGrid.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.dataset.eventId;
            openEventModal(eventId);
        });
    });
}

// Display events
function displayEvents(events) {
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <h3>No Events Found</h3>
                <p>Try adjusting your filters or check back later for new events.</p>
            </div>
        `;
        return;
    }
    
    eventsGrid.innerHTML = events.map(event => createEventCard(event)).join('');
    
    // Add click listeners to event cards
    eventsGrid.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.dataset.eventId;
            openEventModal(eventId);
        });
    });
}

// Create event card HTML
function createEventCard(event, isFeatured = false) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
    const formattedTime = event.time;
    
    const cardClass = isFeatured ? 'event-card featured-event-card' : 'event-card';
    
    return `
        <div class="${cardClass}" data-event-id="${event._id}">
            <div class="event-image">
                ${event.image ? 
                    `<img src="${API_BASE_URL.replace('/api', '')}/${event.image}" alt="${event.title}">` :
                    `<div class="placeholder-text">Event Image</div>`
                }
                <div class="event-date-badge">${formattedDate}</div>
            </div>
            <div class="event-content">
                <div class="event-category">${event.category}</div>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-meta">
                    <div class="event-meta-item">📅 ${eventDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                    <div class="event-meta-item">🕐 ${formattedTime}</div>
                    <div class="event-meta-item">📍 ${event.location}</div>
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-footer">
                    <div class="event-organizer">
                        Organized by ${event.organizer.name}
                    </div>
                    <div class="event-status ${event.status}">${event.status}</div>
                </div>
            </div>
        </div>
    `;
}

// Display pagination
function displayPagination(paginationData) {
    if (!paginationData || paginationData.totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    const { currentPage: page, totalPages, totalEvents, hasNext, hasPrev } = paginationData;
    
    let paginationHTML = `
        <button class="pagination-btn" ${!hasPrev ? 'disabled' : ''} onclick="changePage(${page - 1})">
            Previous
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    paginationHTML += `
        <button class="pagination-btn" ${!hasNext ? 'disabled' : ''} onclick="changePage(${page + 1})">
            Next
        </button>
        <div class="pagination-info">
            Showing ${((page - 1) * 9) + 1}-${Math.min(page * 9, totalEvents)} of ${totalEvents} events
        </div>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    if (page < 1 || isLoading) return;
    currentPage = page;
    loadEvents();
    
    // Scroll to events section
    document.querySelector('.all-events').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Open event modal
async function openEventModal(eventId) {
    try {
        showLoading(modalBody);
        eventModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const data = await response.json();
        
        if (data.success) {
            displayEventModal(data.data);
        } else {
            showError(modalBody, 'Failed to load event details');
        }
    } catch (error) {
        console.error('Error loading event details:', error);
        showError(modalBody, 'Failed to load event details');
    }
}

// Display event in modal
function displayEventModal(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    modalBody.innerHTML = `
        <div class="modal-event-image">
            ${event.image ? 
                `<img src="${API_BASE_URL.replace('/api', '')}/${event.image}" alt="${event.title}">` :
                `<div class="placeholder-text">Event Image</div>`
            }
        </div>
        
        <div class="modal-event-category">${event.category}</div>
        <h2 class="modal-event-title">${event.title}</h2>
        
        <div class="modal-event-meta">
            <div class="modal-meta-item">
                <div class="modal-meta-label">Date</div>
                <div class="modal-meta-value">${formattedDate}</div>
            </div>
            <div class="modal-meta-item">
                <div class="modal-meta-label">Time</div>
                <div class="modal-meta-value">${event.time}</div>
            </div>
            <div class="modal-meta-item">
                <div class="modal-meta-label">Location</div>
                <div class="modal-meta-value">${event.location}</div>
            </div>
            <div class="modal-meta-item">
                <div class="modal-meta-label">Status</div>
                <div class="modal-meta-value">
                    <span class="event-status ${event.status}">${event.status}</span>
                </div>
            </div>
            ${event.registrationRequired ? `
                <div class="modal-meta-item">
                    <div class="modal-meta-label">Registration</div>
                    <div class="modal-meta-value">Required</div>
                </div>
                ${event.maxAttendees ? `
                    <div class="modal-meta-item">
                        <div class="modal-meta-label">Capacity</div>
                        <div class="modal-meta-value">${event.currentAttendees}/${event.maxAttendees}</div>
                    </div>
                ` : ''}
            ` : ''}
        </div>
        
        <div class="modal-event-description">
            ${event.description}
        </div>
        
        <div class="modal-event-organizer">
            <div class="modal-organizer-title">Event Organizer</div>
            <div class="modal-organizer-info">
                <strong>${event.organizer.name}</strong><br>
                Email: <a href="mailto:${event.organizer.email}">${event.organizer.email}</a>
                ${event.organizer.phone ? `<br>Phone: ${event.organizer.phone}` : ''}
            </div>
        </div>
        
        ${event.tags && event.tags.length > 0 ? `
            <div class="modal-event-tags">
                <div class="modal-meta-label">Tags</div>
                <div class="event-tags">
                    ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

// Close modal
function closeModal() {
    eventModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Show loading state
function showLoading(container) {
    container.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

// Show error state
function showError(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time for display
function formatTime(timeString) {
    // Assuming time is in HH:MM format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Export functions for global access
window.changePage = changePage;

console.log('Events page loaded successfully! 🎉');